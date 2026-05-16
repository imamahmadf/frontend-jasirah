import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import { BsCartDash } from "react-icons/bs";

import { BsClipboard2Data } from "react-icons/bs";
import { BsLock } from "react-icons/bs";
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
  Badge,
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
import { BsCartPlus } from "react-icons/bs";
function DaftarKwitansiGlobalKeuangan() {
  const [dataKwitGlobal, setDataKwitGlobal] = useState([]);
  const history = useHistory();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataKPA, setDataKPA] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState(null);
  const [dataTemplate, setDataTemplate] = useState(null);
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);

  // Filter states
  const [filterSumberDanaId, setFilterSumberDanaId] = useState(null);
  const [filterJenisPerjalananId, setFilterJenisPerjalananId] = useState(null);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState(null);

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  async function fetchKwitansiGlobal() {
    // Build query string directly like the example
    let queryString = `page=${page}&limit=${limit}`;

    // Add unitKerjaId only if filter is selected by user (no default value)
    if (filterUnitKerjaId) {
      queryString += `&unitKerjaId=${filterUnitKerjaId}`;
    }

    // Add filter parameters (only if they have values)
    if (filterSumberDanaId) {
      queryString += `&sumberDanaId=${filterSumberDanaId}`;
    }
    if (filterJenisPerjalananId) {
      queryString += `&jenisPerjalananId=${filterJenisPerjalananId}`;
    }
    if (filterStatus) {
      queryString += `&status=${filterStatus}`;
    }
    if (filterTanggalAwal) {
      queryString += `&tanggalAwal=${filterTanggalAwal}`;
    }
    if (filterTanggalAkhir) {
      queryString += `&tanggalAkhir=${filterTanggalAkhir}`;
    }

    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get/all?${queryString}`
      )
      .then((res) => {
        setDataKwitGlobal(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        setDataKPA(res.data.resultKPA);
        setDataBendahara(res.data.resultBendahara);
        setDataJenisPerjalanan(res.data.resultJenisPerjalanan);
        setDataTemplate(res.data.resultTemplate);
        setDataSubKegiatan(res.data.resultDaftarSubKegiatan);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchSumberDana() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/sumber-dana`
      );
      setDataSumberDana(res.data.result);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUnitKerja() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
      );
      setDataUnitKerja(res.data.result);
    } catch (err) {
      console.error(err);
    }
  }

  const resetFilter = () => {
    setFilterSumberDanaId(null);
    setFilterJenisPerjalananId(null);
    setFilterUnitKerjaId(null);
    setFilterStatus(null);
    setFilterTanggalAwal("");
    setFilterTanggalAkhir("");
    setPage(0);
  };

  useEffect(() => {
    fetchKwitansiGlobal();
  }, [
    page,
    filterSumberDanaId,
    filterJenisPerjalananId,
    filterUnitKerjaId,
    filterStatus,
    filterTanggalAwal,
    filterTanggalAkhir,
  ]);

  useEffect(() => {
    fetchSumberDana();
    fetchUnitKerja();
  }, []);
  return (
    <>
      <Layout>
        <Box minH={"70vh"} bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            maxW={"3280px"}
            p={"30px"}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="md"
          >
            <Heading
              size="lg"
              mb={6}
              color={colorMode === "dark" ? "white" : "gray.700"}
            >
              Daftar Kwitansi Global Keuangan
            </Heading>

            {/* Filter Section */}
            <Box
              mb={6}
              p={4}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="8px"
            >
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading
                  size="sm"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Filter Data
                </Heading>
                <Button size="sm" colorScheme="gray" onClick={resetFilter}>
                  Reset Filter
                </Button>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Sumber Dana
                  </FormLabel>
                  <Select2
                    options={dataSumberDana?.map((val) => ({
                      value: val.id,
                      label: val.sumber,
                    }))}
                    placeholder="Pilih Sumber Dana"
                    onChange={(selectedOption) => {
                      setFilterSumberDanaId(selectedOption?.value || null);
                    }}
                    value={
                      filterSumberDanaId
                        ? {
                            value: filterSumberDanaId,
                            label:
                              dataSumberDana?.find(
                                (val) => val.id === filterSumberDanaId
                              )?.sumber || "",
                          }
                        : null
                    }
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
                    Jenis Perjalanan
                  </FormLabel>
                  <Select2
                    options={dataJenisPerjalanan?.map((val) => ({
                      value: val.id,
                      label: val.jenis,
                    }))}
                    placeholder="Pilih Jenis Perjalanan"
                    onChange={(selectedOption) => {
                      setFilterJenisPerjalananId(selectedOption?.value || null);
                    }}
                    value={
                      filterJenisPerjalananId
                        ? {
                            value: filterJenisPerjalananId,
                            label:
                              dataJenisPerjalanan?.find(
                                (val) => val.id === filterJenisPerjalananId
                              )?.jenis || "",
                          }
                        : null
                    }
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
                    Unit Kerja
                  </FormLabel>
                  <Select2
                    options={dataUnitKerja?.map((val) => ({
                      value: val.id,
                      label: val.unitKerja,
                    }))}
                    placeholder="Pilih Unit Kerja"
                    onChange={(selectedOption) => {
                      setFilterUnitKerjaId(selectedOption?.value || null);
                    }}
                    value={
                      filterUnitKerjaId
                        ? {
                            value: filterUnitKerjaId,
                            label:
                              dataUnitKerja?.find(
                                (val) => val.id === filterUnitKerjaId
                              )?.unitKerja || "",
                          }
                        : null
                    }
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
                    Status
                  </FormLabel>
                  <Select2
                    options={[
                      { value: "dibuat", label: "Dibuat" },
                      { value: "diajukan", label: "Diajukan" },
                      { value: "ditolak", label: "Ditolak" },
                      { value: "diterima", label: "Diterima" },
                    ]}
                    placeholder="Pilih Status"
                    onChange={(selectedOption) => {
                      setFilterStatus(selectedOption?.value || null);
                    }}
                    value={
                      filterStatus
                        ? {
                            value: filterStatus,
                            label:
                              filterStatus === "dibuat"
                                ? "Dibuat"
                                : filterStatus === "diajukan"
                                ? "Diajukan"
                                : filterStatus === "ditolak"
                                ? "Ditolak"
                                : "Diterima",
                          }
                        : null
                    }
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
                    Tanggal Pengajuan (Awal)
                  </FormLabel>
                  <Input
                    type="date"
                    value={filterTanggalAwal}
                    onChange={(e) => setFilterTanggalAwal(e.target.value)}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    height="40px"
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
                    Tanggal Pengajuan (Akhir)
                  </FormLabel>
                  <Input
                    type="date"
                    value={filterTanggalAkhir}
                    onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    height="40px"
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
            </Box>

            <HStack gap={5} mb={"30px"}>
              <Spacer />
            </HStack>
            <Table variant={"primary"} size="md">
              <Thead>
                <Tr>
                  <Th>Tanggal Pengajuan</Th>
                  <Th>Jenis Perjalanan</Th>
                  <Th>Unit Kerja</Th>
                  <Th>Sub Kegiatan</Th>
                  <Th>Pengguna Anggaran</Th>
                  <Th>Bendahara</Th>
                  <Th>Sumber Dana</Th>
                  <Th>Total Nilai</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataKwitGlobal?.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      {item?.createdAt
                        ? new Date(item?.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </Td>
                    <Td>{item?.jenisPerjalanan?.jenis || "-"}</Td>
                    <Td>{item?.unitKerja?.unitKerja || "-"}</Td>
                    <Td>{item?.subKegiatan?.subKegiatan || "-"}</Td>
                    <Td>{item?.KPA?.pegawai_KPA?.nama || "-"}</Td>
                    <Td>{item?.bendahara?.pegawai_bendahara?.nama || "-"}</Td>
                    <Td>{item?.bendahara?.sumberDana?.sumber || "-"}</Td>
                    <Td>
                      <Text fontWeight="medium">
                        {formatRupiah(item?.total)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item?.status === "dibuat"
                            ? "blue"
                            : item?.status === "diajukan"
                            ? "yellow"
                            : item?.status === "ditolak"
                            ? "red"
                            : item?.status === "diterima"
                            ? "green"
                            : "gray"
                        }
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        textTransform="capitalize"
                      >
                        {item?.status || "-"}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() =>
                          history.push(
                            `/keuangan/detail-kwitansi-global/${item.id}`
                          )
                        }
                      >
                        Detail
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Box mt={6}>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total Data: {rows} | Halaman {page + 1} dari {pages}
              </Text>
            </Box>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
                marginTop: "20px",
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
          </Container>
        </Box>
      </Layout>
    </>
  );
}

export default DaftarKwitansiGlobalKeuangan;
