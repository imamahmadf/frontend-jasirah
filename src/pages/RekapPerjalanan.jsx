import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import ReactPaginate from "react-paginate";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { BsDownload, BsX } from "react-icons/bs";
import "../Style/pagination.css";
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
  Heading,
  SimpleGrid,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../Redux/Reducers/auth";
import Loading from "../Componets/Loading";
import DataKosong from "../Componets/DataKosong";

function RekapPerjalanan() {
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
  const [loading, setLoading] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const resetFilter = () => {
    setPegawaiId(0);
    setSubKegiatanId(0);
    setTanggalAwal("");
    setTanggalAkhir("");
    setSelectedPegawai(null);
    setPage(0);
  };

  async function fetchSubKegiatan() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/get-filter/${user[0]?.unitKerja_profile?.id}`
      );
      setDataSubKegiatan(res.data.result);
    } catch (err) {
      console.error(err);
    }
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap/get/perjalanan/download?subKegiatanId=${subKegiatanId}&unitKerjaId=${
          user[0]?.unitKerja_profile?.id
        }`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
          // headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-Kendaraan-dinas.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };

  async function fetchDataRekap() {
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap/get?time=${time}&page=${page}&limit=${limit}&subKegiatanId=${subKegiatanId}&unitKerjaId=${
          user[0]?.unitKerja_profile?.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}&pegawaiId=${pegawaiId}`
      );
      setDataRekap(res.data.result);
      setPage(res.data.page);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataRekap();
    fetchSubKegiatan();
  }, [page, subKegiatanId, tanggalAkhir, tanggalAwal, pegawaiId]);

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={{ base: "15px", md: "30px" }}>
        <Container maxW={"2280px"} variant={"primary"} pt={"30px"} ps={"0px"}>
          {/* Header Section */}
          <Box
            bg={colorMode === "dark" ? "gray.800" : "white"}
            p={{ base: "20px", md: "30px" }}
            borderRadius={"10px"}
            boxShadow="sm"
            border="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            mb={"30px"}
          >
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
                Rekap Perjalanan Dinas
              </Heading>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Total: {rows} data
              </Text>
            </Flex>

            <Divider mb={6} />

            {/* Filter Section */}
            <Box
              mb={4}
              p={4}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="8px"
            >
              <Flex
                justify="space-between"
                align="center"
                mb={4}
                direction={{ base: "column", md: "row" }}
                gap={3}
              >
                <Heading
                  size="sm"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Filter & Pencarian
                </Heading>
                <Button
                  leftIcon={<BsDownload />}
                  onClick={downloadExcel}
                  colorScheme="green"
                  size="sm"
                >
                  Unduh Excel
                </Button>
              </Flex>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 4 }}
                spacing={4}
                mb={4}
              >
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Nama Pegawai
                  </FormLabel>
                  <AsyncSelect
                    value={selectedPegawai}
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
                      if (selectedOption) {
                        setPegawaiId(selectedOption.value.id);
                        setSelectedPegawai(selectedOption);
                      } else {
                        setPegawaiId(0);
                        setSelectedPegawai(null);
                      }
                    }}
                    isClearable
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
                        minHeight: "40px",
                        _hover: {
                          borderColor: "primary",
                        },
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
                    placeholder="Pilih Sub Kegiatan"
                    onChange={(selectedOption) => {
                      setSubKegiatanId(selectedOption?.value || 0);
                    }}
                    isClearable
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
                        minHeight: "40px",
                        _hover: {
                          borderColor: "primary",
                        },
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

              <Flex justify="flex-end">
                <Button
                  leftIcon={<BsX />}
                  onClick={resetFilter}
                  variant="outline"
                  colorScheme="gray"
                  size="sm"
                  isDisabled={
                    !pegawaiId &&
                    !subKegiatanId &&
                    !tanggalAwal &&
                    !tanggalAkhir
                  }
                >
                  Reset Filter
                </Button>
              </Flex>
            </Box>
          </Box>
          {/* Table Section */}
          <Box
            style={{ overflowX: "auto" }}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            p={{ base: "20px", md: "30px" }}
            borderRadius={"10px"}
            boxShadow="sm"
            border="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            {loading ? (
              <Center py={20}>
                <Flex direction="column" align="center" gap={4}>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="primary"
                    size="xl"
                  />
                  <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                    Memuat data...
                  </Text>
                </Flex>
              </Center>
            ) : dataRekap.length === 0 ? (
              <Center py={20}>
                <Flex direction="column" align="center" gap={4}>
                  <Text
                    fontSize="lg"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Tidak ada data yang ditemukan
                  </Text>
                  {(pegawaiId ||
                    subKegiatanId ||
                    tanggalAwal ||
                    tanggalAkhir) && (
                    <Button onClick={resetFilter} size="sm" variant="outline">
                      Reset Filter
                    </Button>
                  )}
                </Flex>
              </Center>
            ) : (
              <>
                <Table
                  variant="simple"
                  colorScheme={colorMode === "dark" ? "gray" : "blue"}
                >
                  <Thead>
                    <Tr>
                      <Th>No. Surat Tugas</Th>
                      <Th>Tujuan</Th>
                      <Th>Tanggal Berangkat</Th>
                      <Th>Tanggal Pulang</Th>
                      <Th>Nama Pegawai</Th>
                      <Th>No. SPD</Th>
                      <Th>Sub Kegiatan</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dataRekap.map((item) =>
                      item.personils?.map((personil, idx) => (
                        <Tr key={`${item.id}-${personil.id || idx}`}>
                          <Td>{item.noSuratTugas || "-"}</Td>
                          <Td>
                            {item.jenisPerjalanan?.tipePerjalanan?.id === 1
                              ? item.tempats?.map((val) => (
                                  <Text key={val.id} fontSize="sm">
                                    {val.dalamKota?.nama || "-"}
                                  </Text>
                                )) || "-"
                              : item.tempats?.map((val) => (
                                  <Text key={val.id} fontSize="sm">
                                    {val.tempat || "-"}
                                  </Text>
                                )) || "-"}
                          </Td>
                          <Td>
                            {item.tempats?.[0]?.tanggalBerangkat
                              ? new Date(
                                  item.tempats[0].tanggalBerangkat
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </Td>
                          <Td>
                            {item.tempats?.[item.tempats.length - 1]
                              ?.tanggalPulang
                              ? new Date(
                                  item.tempats[
                                    item.tempats.length - 1
                                  ].tanggalPulang
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </Td>
                          <Td>{personil.pegawai?.nama || "-"}</Td>
                          <Td>{personil.nomorSPD || "-"}</Td>
                          <Td>{item.daftarSubKegiatan?.subKegiatan || "-"}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>

                {pages > 1 && (
                  <Box mt={6} display="flex" justifyContent="center">
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
                      forcePage={page}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}
export default RekapPerjalanan;
