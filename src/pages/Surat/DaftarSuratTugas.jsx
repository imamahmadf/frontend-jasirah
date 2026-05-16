import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
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
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useDisclosure,
  useColorMode,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Heading,
  VStack,
  Divider,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import {
  BsEyeFill,
  BsThreeDotsVertical,
  BsX,
  BsDownload,
} from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

import DataKosong from "../../Componets/DataKosong";

function DaftarSuratTugas() {
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [pegawaiId, setPegawaiId] = useState(0);
  const [time, setTime] = useState("");
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [subKegiatanId, setSubKegiatanId] = useState(0);
  const [dataRekap, setDataRekap] = useState([]);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [untuk, setUntuk] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState(null);
  const [unitKerjaIdFilter, setUnitKerjaIdFilter] = useState(null);
  // State untuk modal Tambah
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const toast = useToast();
  // Tambah SPPD modal states
  const [personilsTambah, setPersonilsTambah] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [dataSeed, setDataSeed] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState([]);
  const [selectedJenisPerjalanan, setSelectedJenisPerjalanan] = useState(null);
  const [perjalananKota, setPerjalananKota] = useState([
    { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKota, setDataKota] = useState([
    { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [isSubmittingTambah, setIsSubmittingTambah] = useState(false);

  const resetModalForm = () => {
    setPersonilsTambah([null, null, null, null, null]);
    setDataSeed(null);
    setDataJenisPerjalanan([]);
    setSelectedJenisPerjalanan(null);
    setPerjalananKota([{ kota: "", tanggalBerangkat: "", tanggalPulang: "" }]);
    setDataKota([
      { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const resetFilter = () => {
    setTanggalAwal("");
    setTanggalAkhir("");
    setPegawaiId(0);
    setSubKegiatanId(0);
    setUnitKerjaIdFilter(null);
  };

  const fetchSeedPerjalanan = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/seed?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&unitKerjaId=${user[0]?.unitKerja_profile?.id}`
      );
      setDataSeed(res.data);
      const sumberPertama = res.data?.resultSumberDana?.[0];
      if (sumberPertama?.id) {
        await fetchJenisPerjalanan(sumberPertama.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJenisPerjalanan = async (sumberDanaId) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/jenis-perjalanan/${sumberDanaId}`
      );
      setDataJenisPerjalanan(res.data?.result || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTambah = async () => {
    resetModalForm();
    await fetchSeedPerjalanan();
    onTambahOpen();
  };

  const handlePerjalananChange = (index, field, value) => {
    const next = [...perjalananKota];
    next[index][field] = value;
    setPerjalananKota(next);
  };

  const addPerjalanan = () => {
    setPerjalananKota([
      ...perjalananKota,
      { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const handleDalamKotaChange = (index, field, value) => {
    const next = [...dataKota];
    next[index][field] = value;
    setDataKota(next);
  };

  const addDataKota = () => {
    setDataKota([
      ...dataKota,
      { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap/get/surat-tugas/download?subKegiatanId=${subKegiatanId}&unitKerjaId=${
          unitKerjaIdFilter || user[0]?.unitKerja_profile?.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}&pegawaiId=${pegawaiId}`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-surat-tugas.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil",
        description: "File Excel berhasil diunduh",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      toast({
        title: "Error",
        description: "Gagal mengunduh file Excel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function fetchSubKegiatan() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/get-filter/${user[0]?.unitKerja_profile?.id}`
      );
      setDataSubKegiatan(res.data.result);

      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  }
  async function fetchDataRekap() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap/get/surat-tugas?time=${time}&page=${page}&limit=${limit}&subKegiatanId=${subKegiatanId}&unitKerjaId=${
          unitKerjaIdFilter || user[0]?.unitKerja_profile?.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}&pegawaiId=${pegawaiId}`
      );
      setDataRekap(res.data.result);
      setPage(res.data.page);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
      console.log("Data dari backend:", res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data surat tugas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    fetchDataRekap();
    fetchSubKegiatan();
  }, [
    page,
    subKegiatanId,
    tanggalAkhir,
    tanggalAwal,
    pegawaiId,
    unitKerjaIdFilter,
  ]);

  return (
    <Layout>
      <Box
        bg={colorMode === "dark" ? "gray.900" : "secondary.light"}
        pb={{ base: "30px", md: "40px" }}
        px={{ base: "15px", md: "30px" }}
        minH="100vh"
      >
        {/* Tabel Data Surat Tugas */}
        <Box
          mt={{ base: "30px", md: "40px" }}
          bg={colorMode === "dark" ? "gray.800" : "white"}
          p={{ base: "20px", md: "30px" }}
          borderRadius={"10px"}
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          {/* Header Section */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <Heading
              size="lg"
              color={colorMode === "dark" ? "white" : "gray.700"}
            >
              Daftar Surat Tugas
            </Heading>
            <HStack spacing={3}>
              <Button
                variant={"primary"}
                fontWeight={900}
                onClick={downloadExcel}
                leftIcon={<Icon as={BsDownload} />}
              >
                Download Excel
              </Button>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Total: {rows} data
              </Text>
            </HStack>
          </Flex>

          <Divider mb={6} />

          {/* Filter Section */}
          <Box
            mb={6}
            p={4}
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderRadius="8px"
          >
            <Heading
              size="sm"
              mb={4}
              color={colorMode === "dark" ? "white" : "gray.700"}
            >
              Filter Data
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Unit Kerja
                </FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/admin/search/unit-kerja?q=${inputValue}`
                      );
                      return res.data.result.map((val) => ({
                        value: val.id,
                        label: val.unitKerja,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik Nama Unit Kerja"
                  onChange={(selectedOption) => {
                    setUnitKerjaIdFilter(selectedOption?.value || null);
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "gray.800" : "white",
                      border: "1px solid",
                      borderColor:
                        colorMode === "dark" ? "gray.600" : "gray.300",
                      height: "40px",
                      _hover: { borderColor: "primary" },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nama Pegawai
                </FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/pegawai/search?q=${inputValue}`
                      );
                      return res.data.result.map((val) => ({
                        value: val,
                        label: val.nama,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik Nama Pegawai"
                  onChange={(selectedOption) => {
                    setPegawaiId(selectedOption?.value?.id || 0);
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "gray.800" : "white",
                      border: "1px solid",
                      borderColor:
                        colorMode === "dark" ? "gray.600" : "gray.300",
                      height: "40px",
                      _hover: { borderColor: "primary" },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Sub Kegiatan
                </FormLabel>
                <Select2
                  options={dataSubKegiatan?.map((val) => {
                    return {
                      value: val.id,
                      label: `${val.subKegiatan} - ${val.kodeRekening}`,
                    };
                  })}
                  placeholder="Cari Kegiatan"
                  onChange={(selectedOption) => {
                    setSubKegiatanId(selectedOption?.value || 0);
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "gray.800" : "white",
                      border: "1px solid",
                      borderColor:
                        colorMode === "dark" ? "gray.600" : "gray.300",
                      height: "40px",
                      _hover: {
                        borderColor: "primary",
                      },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tanggal Berangkat (Awal)
                </FormLabel>
                <Input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    borderColor: "primary",
                  }}
                  _focus={{
                    borderColor: "primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tanggal Pulang (Akhir)
                </FormLabel>
                <Input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    borderColor: "primary",
                  }}
                  _focus={{
                    borderColor: "primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
                  }}
                />
              </FormControl>
            </SimpleGrid>
            <Button
              leftIcon={<Icon as={BsX} />}
              onClick={resetFilter}
              variant="outline"
              colorScheme="gray"
              isDisabled={
                !tanggalAwal &&
                !tanggalAkhir &&
                !pegawaiId &&
                !subKegiatanId &&
                !unitKerjaIdFilter
              }
            >
              Reset Filter
            </Button>
          </Box>

          {/* Table Section */}
          <Box
            style={{ overflowX: "auto" }}
            borderRadius="8px"
            border="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Table variant={"primary"} size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th
                    position="sticky"
                    left={0}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    zIndex={1}
                    minW="50px"
                  >
                    No.
                  </Th>
                  <Th minW="150px">No. Surat Tugas</Th>
                  <Th minW="180px">Tanggal Berangkat</Th>
                  <Th minW="180px">Tanggal Pulang</Th>
                  <Th minW="200px">Jenis & Tujuan</Th>
                  <Th minW="150px">Personil 1</Th>
                  <Th minW="150px">Personil 2</Th>
                  <Th minW="150px">Personil 3</Th>
                  <Th minW="150px">Personil 4</Th>
                  <Th minW="150px">Personil 5</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataRekap && dataRekap.length > 0 ? (
                  dataRekap.map((item, index) => (
                    <Tr
                      key={item?.id || index}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.750" : "gray.50",
                      }}
                      transition="background-color 0.2s"
                    >
                      <Td
                        position="sticky"
                        left={0}
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        zIndex={1}
                        fontWeight="medium"
                      >
                        {index + 1 + page * limit}
                      </Td>
                      <Td>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "white" : "gray.700"}
                        >
                          {item?.noSuratTugas || "-"}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item?.tempats?.[0]?.tanggalBerangkat
                            ? new Date(
                                item?.tempats?.[0]?.tanggalBerangkat
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item?.tempats?.[item?.tempats?.length - 1]
                            ?.tanggalPulang
                            ? new Date(
                                item?.tempats?.[
                                  item?.tempats?.length - 1
                                ]?.tanggalPulang
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          <Box>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                              mb={1}
                            >
                              Jenis:
                            </Text>
                            <Badge
                              colorScheme="primary"
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {item?.jenisPerjalanan?.jenis || "-"}
                            </Badge>
                          </Box>
                          {item?.tempats?.length > 0 && (
                            <Box>
                              <Text
                                fontSize="xs"
                                color={
                                  colorMode === "dark" ? "gray.400" : "gray.600"
                                }
                                mb={1}
                              >
                                Tujuan:
                              </Text>
                              {item?.jenisPerjalanan?.tipePerjalanan?.id === 1
                                ? item?.tempats?.map((val) => (
                                    <Text
                                      key={val?.id || Math.random()}
                                      fontWeight="medium"
                                      fontSize="sm"
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.700"
                                      }
                                    >
                                      {val?.dalamKota?.nama || "-"}
                                    </Text>
                                  ))
                                : item?.tempats?.map((val) => (
                                    <Text
                                      key={val?.id || Math.random()}
                                      fontWeight="medium"
                                      fontSize="sm"
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.700"
                                      }
                                    >
                                      {val?.tempat || "-"}
                                    </Text>
                                  ))}
                            </Box>
                          )}
                        </VStack>
                      </Td>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Td key={i}>
                          {item?.personils?.[i] ? (
                            <Tooltip
                              label={
                                item?.personils?.[i]?.status?.statusKuitansi ||
                                "-"
                              }
                              aria-label="Status tooltip"
                              bg={
                                item?.personils?.[i]?.statusId === 1
                                  ? "gelap"
                                  : item?.personils?.[i]?.statusId === 2
                                  ? "ungu"
                                  : item?.personils?.[i]?.statusId === 3
                                  ? "primary"
                                  : item?.personils?.[i]?.statusId === 4
                                  ? "danger"
                                  : "gray.600"
                              }
                              hasArrow
                              placement="top"
                            >
                              <Badge
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                px={3}
                                py={1.5}
                                maxW="200px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                borderRadius="md"
                                textTransform="none"
                                fontSize="xs"
                                fontWeight="medium"
                                bgColor={
                                  item?.personils?.[i]?.statusId === 1
                                    ? "gelap"
                                    : item?.personils?.[i]?.statusId === 2
                                    ? "ungu"
                                    : item?.personils?.[i]?.statusId === 3
                                    ? "primary"
                                    : item?.personils?.[i]?.statusId === 4
                                    ? "danger"
                                    : "gray.200"
                                }
                                color={
                                  item?.personils?.[i]?.statusId === 1 ||
                                  item?.personils?.[i]?.statusId === 2 ||
                                  item?.personils?.[i]?.statusId === 3 ||
                                  item?.personils?.[i]?.statusId === 4
                                    ? "white"
                                    : "gray.700"
                                }
                                cursor="help"
                              >
                                {item?.personils?.[i]?.pegawai?.nama || "-"}
                              </Badge>
                            </Tooltip>
                          ) : (
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.500" : "gray.400"
                              }
                              fontStyle="italic"
                            >
                              -
                            </Text>
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={10} textAlign="center">
                      <DataKosong />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
          {/* Pagination */}
          <Box
            mt={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <ReactPaginate
              previousLabel={"←"}
              nextLabel={"→"}
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
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
export default DaftarSuratTugas;
