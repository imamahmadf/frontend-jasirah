import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../Style/pagination.css";
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
import { userRedux, selectRole } from "../Redux/Reducers/auth";
import { BsCartPlus } from "react-icons/bs";
function DaftarKwitansiGlobal() {
  const [dataKwitGlobal, setDataKwitGlobal] = useState([]);
  const history = useHistory();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [nama, setNama] = useState("");

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const [pegawaiId, setPegawaiId] = useState(0);
  const [PPTKId, setPPTKId] = useState(0);
  const [bendaharaId, setBendaharaId] = useState(null);
  const [KPAId, setKPAId] = useState(null);
  const [jenisPerjalananId, setJenisPerjalananId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [subKegiatanId, setSubKegiatanId] = useState(null);
  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataKPA, setDataKPA] = useState(null);
  const [dataPPTK, setDataPPTK] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState(null);
  const [dataTemplate, setDataTemplate] = useState(null);
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isHapusOpen,
    onOpen: onHapusOpen,
    onClose: onHapusClose,
  } = useDisclosure();
  const [selectedId, setSelectedId] = useState(null);

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
  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "spek") {
      setSpesifikasi(val);
    } else if (field == "jumlah") {
      setJumlah(parseInt(val));
    } else if (field == "harga") {
      setHarga(parseInt(val));
    } else if (field == "tanggal") {
      setTanggal(val);
    } else if (field == "keterangan") {
      setKeterangan(val);
    }
  };

  const hapusKwitansi = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/hapus/${id}`
      );
      toast({
        title: "Berhasil!",
        description: "Kwitansi berhasil dihapus.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onHapusClose();
      fetchKwitansiGlobal();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal menghapus kwitansi.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  async function fetchKwitansiGlobal() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get?page=${page}&limit=${limit}&unitKerjaId=${
          user[0]?.unitKerja_profile?.id
        }&indukUnitKerjaId=${user[0]?.unitKerja_profile?.indukUnitKerja?.id}`
      )
      .then((res) => {
        setDataKwitGlobal(res?.data?.result);
        setPage(res?.data?.page);
        setPages(res?.data?.totalPage);
        setRows(res.data?.totalRows);
        setDataKPA(res?.data?.resultKPA);
        setDataBendahara(res?.data?.resultBendahara);
        setDataJenisPerjalanan(res?.data?.resultJenisPerjalanan);
        setDataTemplate(res.data?.resultTemplate);
        setDataSubKegiatan(res.data?.resultDaftarSubKegiatan);
        setDataPPTK(res.data?.resultPPTK);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  const tambahKwitansiGlobal = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kwitansi-global/post`,
        {
          pegawaiId,
          KPAId,
          bendaharaId,
          templateKwitGlobalId: templateId,
          jenisPerjalananId,
          unitKerjaId: user[0]?.unitKerja_profile?.id,
          subKegiatanId,
          PPTKId,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
        onTambahClose();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };

  useEffect(() => {
    fetchKwitansiGlobal();
  }, [page]);
  return (
    <>
      <Layout>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            maxW={"1280px"}
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
              Daftar Kwitansi Global
            </Heading>
            <Flex justify="space-between" align="center" mb={6}>
              <Button
                onClick={onTambahOpen}
                variant={"primary"}
                size="md"
                leftIcon={<BsCartPlus />}
              >
                Tambah Kwitansi
              </Button>
            </Flex>
            <Table variant={"primary"} size="md">
              <Thead>
                <Tr>
                  <Th>Tanggal Pengajuan</Th>
                  <Th>Jenis Perjalanan</Th>
                  <Th>Sub Kegiatan</Th>
                  <Th>Pengguna Anggaran</Th>
                  <Th>Bendahara</Th>
                  <Th>Total Nilai</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataKwitGlobal?.length > 0 ? (
                  dataKwitGlobal.map((item, index) => (
                    <Tr key={index}>
                      <Td>
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </Td>
                      <Td>{item?.jenisPerjalanan?.jenis || "-"}</Td>
                      <Td>{item?.subKegiatan?.subKegiatan || "-"}</Td>
                      <Td>{item?.KPA?.pegawai_KPA?.nama || "-"}</Td>
                      <Td>{item?.bendahara?.pegawai_bendahara?.nama || "-"}</Td>
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
                          {item?.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack gap={2} spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() =>
                              history.push(
                                `/perjalanan/detail-kwitansi-global/${item?.id}`
                              )
                            }
                          >
                            Detail
                          </Button>
                          {(item?.status === "ditolak" ||
                            item?.status === "dibuat") && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => {
                                setSelectedId(item?.id);
                                onHapusOpen();
                              }}
                            >
                              Hapus
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <Text color="gray.500">Tidak ada data</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Container>{" "}
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
        </Box>{" "}
        <Modal
          closeOnOverlayClick={false}
          isOpen={isTambahOpen}
          onClose={onTambahClose}
          size="xl"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent borderRadius="lg" maxWidth="1200px">
            <ModalHeader>
              <HStack>
                <Box
                  bgColor={"primary"}
                  width={"30px"}
                  height={"30px"}
                  borderRadius="md"
                ></Box>
                <Heading color={"primary"} size="md">
                  Buat Kwitansi Global
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box pt={4}>
                <SimpleGrid columns={2} spacing={6}>
                  <FormControl>
                    <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue) return [];
                        try {
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/pegawai/search?q=${inputValue}`
                          );

                          const filtered = res?.data?.result;

                          return filtered.map((val) => ({
                            value: val?.id,
                            label: val?.nama,
                          }));
                        } catch (err) {
                          console.error("Failed to load options:", err.message);
                          return [];
                        }
                      }}
                      placeholder="Ketik Nama Pegawai"
                      onChange={(selectedOption) => {
                        setPegawaiId(selectedOption.value);
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
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: { borderColor: "yellow.700" },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Pengguna Anggaran</FormLabel>
                    <Select2
                      options={dataKPA?.map((val) => ({
                        value: val?.id,
                        label: `${val?.pegawai_KPA?.nama}`,
                      }))}
                      placeholder="Pilih Pengguna Anggaran"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setKPAId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Bendahara</FormLabel>
                    <Select2
                      options={dataBendahara?.map((val) => ({
                        value: val?.id,
                        label: `${val?.pegawai_bendahara?.nama}`,
                      }))}
                      placeholder="Pilih Bendahara"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setBendaharaId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>
                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Sub Kegiatan</FormLabel>
                    <Select2
                      options={dataSubKegiatan?.map((val) => ({
                        value: val?.id,
                        label: `${val?.subKegiatan}`,
                      }))}
                      placeholder="Pilih Sub Kegiatan"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setSubKegiatanId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>
                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Jenis Perjalanan</FormLabel>
                    <Select2
                      options={dataJenisPerjalanan?.map((val) => ({
                        value: val?.id,
                        label: `${val?.jenis}`,
                      }))}
                      placeholder="Pilih Jenis Perjalanan"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setJenisPerjalananId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>PPTK</FormLabel>
                    <Select2
                      options={dataPPTK?.map((val) => ({
                        value: val?.id,
                        label: `${val?.pegawai_PPTK?.nama}`,
                      }))}
                      placeholder="Pilih PPTK"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setPPTKId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Jenis Kwitansi</FormLabel>
                    <Select2
                      options={dataTemplate?.map((val) => ({
                        value: val?.id,
                        label: `${val?.nama}`,
                      }))}
                      placeholder="Pilih Jenis Kwitansi"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setTemplateId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null, // Hilangkan tombol panah
                        IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: {
                            borderColor: "yellow.700",
                          },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "aset" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            </ModalBody>

            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={onTambahClose}>
                Batal
              </Button>
              <Button onClick={tambahKwitansiGlobal} variant={"primary"}>
                Buat Kwitansi Global
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Modal Konfirmasi Hapus */}
        <Modal isOpen={isHapusOpen} onClose={onHapusClose} isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent borderRadius="lg">
            <ModalHeader>Konfirmasi Hapus</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Apakah Anda yakin ingin menghapus kwitansi ini? Tindakan ini
                tidak dapat dibatalkan.
              </Text>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={onHapusClose}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={() => hapusKwitansi(selectedId)}
              >
                Ya, Hapus
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Layout>
    </>
  );
}

export default DaftarKwitansiGlobal;
