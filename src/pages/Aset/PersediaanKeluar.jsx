import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import {
  Box,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spacer,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

function PersediaanKeluar() {
  const [DataPersediaan, setDataPersediaan] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);

  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  async function fetchStokTersedia() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/stok/${
          user[0]?.unitKerja_profile?.id
        }`
      )
      .then((res) => {
        setDataPersediaan(res.data.result);
        setPages(res.data.totalPage);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchStokTersedia();
  }, [page]);

  return (
    <LayoutAset>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Box
          style={{ overflowX: "auto" }}
          p={"30px"}
          borderRadius={"5px"}
          bg={colorMode === "dark" ? "gray.800" : "white"}
        >
          <HStack gap={5} mb={"30px"}>
            <Text fontSize="lg" fontWeight="bold">
              Daftar Stok Tersedia
            </Text>
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              Pengeluaran barang dilakukan melalui Laporan Persediaan
            </Text>
          </HStack>
          <Table variant={"aset"}>
            <Thead>
              <Tr>
                <Th>tanggal</Th>
                <Th>Kode barang</Th>
                <Th maxWidth={"20px"}>Nama barang</Th>
                <Th>spesifikasi</Th>
                <Th>jumlah masuk</Th>
                <Th>keluar</Th>
                <Th>sisa stok</Th>
                <Th>harga satuan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {DataPersediaan?.map((item) => (
                <Tr key={item.id}>
                  <Td>{item?.tanggal}</Td>
                  <Td>{item?.persediaan?.kodeBarang}</Td>
                  <Td>{item?.persediaan?.nama}</Td>
                  <Td>{item?.spesifikasi}</Td>
                  <Td>{item?.jumlah}</Td>
                  <Td>{item?.totalKeluar ?? 0}</Td>
                  <Td>{item?.sisaStok ?? 0}</Td>
                  <Td>{item?.hargaSatuan}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
          }}
        >
          <ReactPaginate
            previousLabel={"+"}
            nextLabel={"-"}
            pageCount={pages}
            onPageChange={changePage}
            activeClassName={"item active "}
            breakClassName={"item break-me "}
            breakLabel={"..."}
            containerClassName={"pagination"}
            disabledClassName={"disabled-page"}
            marginPagesDisplayed={1}
            nextClassName={"item next "}
            pageClassName={"item pagination-page "}
            pageRangeDisplayed={2}
            previousClassName={"item previous"}
          />
        </div>
      </Box>
    </LayoutAset>
  );
}

export default PersediaanKeluar;
