import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Image,
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Heading,
  SimpleGrid,
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import LayoutAset from "../../Componets/Aset/LayoutAset";
function KendaraanUnitKerja() {
  const [DataKendaraan, setDataKendaraan] = useState([]);
  const history = useHistory();
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(0);
  const [unitKerjaId, setUnitKerjaId] = useState(0);
  const [pegawaiId, setPegawaiId] = useState(0);
  const [statusId, setStatusId] = useState(0);
  const [jenisId, setJenisId] = useState(0);
  const [kondisiId, setKondisiId] = useState(0);
  const [nomorMesin, setNomorMesin] = useState("");
  const [nomorRangka, setNomorRangka] = useState("");
  const [nomorKontak, setNomorKontak] = useState(0);
  const [nomor, setNomor] = useState(0);
  const [seri, setSeri] = useState("");
  const [time, setTime] = useState("");
  const [loadingItems, setLoadingItems] = useState({});
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [dataPegawai, setDataPegawai] = useState(null);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "nomor") {
      setNomor(parseInt(val));
    } else if (field == "seri") {
      setSeri(val);
    } else if (field == "nomorMesin") {
      setNomorMesin(val);
    } else if (field == "nomorRangka") {
      setNomorRangka(val);
    } else if (field == "nomorKontak") {
      setNomorKontak(parseInt(val));
    }
  };

  async function fetchDataKendaraan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan/get/induk-unit-kerja/${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`
      )
      .then((res) => {
        setDataKendaraan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const cekPajak = (val) => {
    setLoadingItems((prev) => ({ ...prev, [val.id]: true }));
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/cek`, {
        id: val.id,
        nomor: val.nomor,
        seri: val.seri,
        phone: 6281350617579,
        kt: "KT",
      })
      .then((res) => {
        // Buat URL untuk file yang diunduh
        console.log(res.data);
        fetchDataKendaraan();

        toast({
          title: "Berhasil",
          description: res.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
        toast({
          title: "Gagal",
          description: "Gagal mengakses SIMPATOR  ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoadingItems((prev) => ({ ...prev, [val.id]: false }));
      });
  };

  useEffect(() => {
    fetchDataKendaraan();
  }, [page]);
  return (
    <>
      <LayoutAset>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            {" "}
            <Flex gap={5}>
              <Spacer />
            </Flex>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>Foto</Th>
                  <Th maxWidth={"20px"}>Unit Kerja</Th>
                  <Th>Nama Pemilik</Th>
                  <Th>NIP </Th>
                  <Th>Nomor Plat</Th>

                  <Th>Jenis Kendaraan</Th>
                  <Th>Merek</Th>
                  <Th>Warna</Th>
                  <Th>tanggal Pajak</Th>
                  <Th>tanggal STNK</Th>
                  <Th>nominal Pajak</Th>
                  <Th>status</Th>
                  <Th>kondisi</Th>
                  <Th>kontak</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {DataKendaraan?.map((item, index) => (
                  <Tr key={item.id}>
                    {" "}
                    <Td>
                      <Image
                        borderRadius={"5px"}
                        alt="foto obat"
                        width="80px"
                        height="100px"
                        overflow="hiden"
                        objectFit="cover"
                        src={
                          item?.foto
                            ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                              item?.foto
                            : Foto
                        }
                      />
                    </Td>
                    <Td>{item?.kendaraanUK.unitKerja}</Td>
                    <Td>{item?.pegawai?.nama}</Td>
                    <Td>{item?.pegawai?.nip}</Td>
                    <Td>{`KT ${item?.nomor} ${item?.seri}`}</Td>
                    <Td>{item?.jenisKendaraan?.jenis}</Td>
                    <Td>{item?.merek}</Td>
                    <Td>{item?.warna}</Td>
                    <Td>
                      {item?.tgl_pkb
                        ? new Date(item?.tgl_pkb).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>
                    <Td>
                      {item?.tg_stnk
                        ? new Date(item?.tg_stnk).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>{" "}
                    <Td>{item?.total}</Td>
                    <Td>{item?.statusKendaraan?.status}</Td>
                    <Td>{item?.kondisi?.nama}</Td>
                    <Td>{item?.noKontak}</Td>
                    <Td>
                      <Flex gap={"10px"}>
                        {item.id ? (
                          <Button
                            variant={"primary"}
                            p={"0px"}
                            fontSize={"14px"}
                            onClick={() =>
                              history.push(
                                `/sijaka/detail-kendaraan/unit-kerja/${item.id}`
                              )
                            }
                          >
                            <BsEyeFill />
                          </Button>
                        ) : null}{" "}
                        <Button
                          variant={"primary"}
                          px={"15px"}
                          fontSize={"14px"}
                          h={"40px"}
                          isLoading={loadingItems[item.id]}
                          loadingText="Mengecek..."
                          onClick={() => {
                            cekPajak(item);
                          }}
                          disabled={loadingItems[item.id]}
                        >
                          Cek Pajak
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </LayoutAset>
    </>
  );
}

export default KendaraanUnitKerja;
