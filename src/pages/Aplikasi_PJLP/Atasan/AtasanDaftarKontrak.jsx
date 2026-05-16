import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Spinner,
  Center,
  Text,
  useToast,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import ReactPaginate from "react-paginate";

import "../../Style/pagination.css";

function AtasanDaftarKontrak() {
  const user = useSelector(userRedux);
  const pegawaiId = user?.[0]?.pegawaiId;
  const history = useHistory();
  const [dataLaporan, setDataLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null); // simpan id yang sedang diupdate
  const [selectedId, setSelectedId] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const changePage = ({ selected }) => {
    setPage(selected);
  };
  const fetchLaporan = async () => {
    if (!pegawaiId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/atasan-PJPL/get/all-kontrak?pegawaiId=${pegawaiId}&page=${page}&limit=${limit}`
      );
      setDataLaporan(res.data.result || []);
      setPage(res.data.page);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal mengambil data laporan kinerja PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pegawaiId]);

  const updateStatus = async (id, statusBaru, nilai) => {
    setIsUpdating(id);
    try {
      const payload = { status: statusBaru };
      if (statusBaru === "diterima" && nilai !== undefined) {
        payload.nilai = nilai;
      }

      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/update/hasil-kerja-pjpl/${id}`,
        payload
      );
      toast({
        title: "Berhasil",
        description: `Status diubah menjadi ${statusBaru}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      fetchLaporan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal mengubah status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenModal = (id) => {
    setSelectedId(id);
    setNilaiInput("");
    onOpen();
  };

  const handleSubmitNilai = () => {
    const parsedNilai = parseFloat(nilaiInput);

    if (Number.isNaN(parsedNilai)) {
      toast({
        title: "Error!",
        description: "Nilai harus diisi.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (parsedNilai < 0 || parsedNilai > 10) {
      toast({
        title: "Error!",
        description: "Nilai harus antara 0 sampai 10.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    updateStatus(selectedId, "diterima", parsedNilai);
    onClose();
  };

  const handleLinkClick = (link) => {
    if (!link) return;
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={6}>Laporan Kinerja PJPL</Heading>

          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : dataLaporan && dataLaporan.length > 0 ? (
            <>
              <Table variant={"pegawai"}>
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Periode Kontrak</Th>
                    <Th>Pegawai</Th>
                    <Th>Jabatan</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody bgColor={"secondary"}>
                  {dataLaporan.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>
                        {item.tanggalAwal && item.tanggalAkhir
                          ? `${new Date(item.tanggalAwal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )} - ${new Date(
                              item.tanggalAkhir
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "-"}
                      </Td>
                      <Td>{item.pegawai.nama || "-"}</Td>
                      <Td>{item.pegawai.jabatan || "-"}</Td>

                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="green"
                          onClick={() =>
                            history.push(
                              `/kepegawaian-ASN/atasan/kontrak/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>{" "}
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
            </>
          ) : (
            <Center py={"50px"}>
              <Text>Tidak ada data laporan kinerja PJPL</Text>
            </Center>
          )}
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default AtasanDaftarKontrak;
