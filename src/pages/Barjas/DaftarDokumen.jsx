import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";

import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import { BsDownload } from "react-icons/bs";
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
  FormErrorMessage,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  VStack,
  Divider,
  Badge,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";

import {
  BsThreeDotsVertical,
  BsEyeFill,
  BsFileEarmarkArrowDown,
} from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function DaftarDokumen() {
  const [DataDokumen, setDataDokumen] = useState([]);
  const history = useHistory();
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const [time, setTime] = useState("");
  const [loadingItems, setLoadingItems] = useState({});
  const [loadingSurat, setLoadingSurat] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [nomorPlat, setNomorPlat] = useState("");
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [subKegPerFilterId, setSubKegPerFilterId] = useState(null);
  const initialValuesTambahSP = {
    subKegPerId: null,
    rekananId: null,
    rekananLabel: "",
    subKegPerLabel: "",
    nomorSPId: null,
    akunBelanjaId: null,
    tanggal: "",
    isTulisManualSP: false,
    nomorSPManual: "",
    isTambahRekananBaru: false,
    namaRekananBaru: "",
  };

  const validationSchemaTambahSP = Yup.object()
    .shape({
      subKegPerId: Yup.mixed()
        .nullable()
        .required("Sub Kegiatan wajib dipilih"),
      rekananId: Yup.mixed()
        .nullable()
        .required("Rekanan wajib dipilih"),
      akunBelanjaId: Yup.mixed()
        .nullable()
        .required("Akun Belanja wajib dipilih"),
      tanggal: Yup.string().required("Tanggal wajib diisi"),
      nomorSPId: Yup.mixed().nullable(),
      nomorSPManual: Yup.string(),
    })
    .test(
      "nomorSP",
      "Nomor SP wajib diisi (pilih dari daftar atau tulis manual)",
      (value) => {
        const hasNomorSPId = value?.nomorSPId != null && value?.nomorSPId !== "";
        const hasNomorSPManual =
          value?.nomorSPManual != null &&
          String(value.nomorSPManual).trim() !== "";
        return hasNomorSPId || hasNomorSPManual;
      }
    );

  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [spToDelete, setSpToDelete] = useState(null);
  const formikRefTambahSP = useRef(null);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setPage(0);
  }, [
    unitKerjaFilterId,
    pegawaiFilterId,
    tanggalAwal,
    tanggalAkhir,
    subKegPerFilterId,
  ]);

  const handleCloseModal = (resetForm) => {
    if (resetForm) resetForm();
    onTambahClose();
  };

  const tambahRekanan = (namaRekananBaru, setFieldValue) => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/rekanan`,
        { nama: namaRekananBaru }
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Rekanan ditambahkan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setFieldValue("namaRekananBaru", "");
        setFieldValue("isTambahRekananBaru", false);
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Gagal Menambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const submitTambahSP = (values, { resetForm, setSubmitting }) => {
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/sp`, {
        subKegPerId: values.subKegPerId,
        nomorSPId: values.isTulisManualSP ? null : values.nomorSPId,
        nomorSPManual: values.isTulisManualSP ? values.nomorSPManual : null,
        rekananId: values.rekananId,
        akunBelanjaId: values.akunBelanjaId,
        tanggal: values.tanggal,
        indukUnitKerjaId: user[0]?.unitKerja_profile?.indukUnitKerja?.id,
      })
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        handleCloseModal(resetForm);
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
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteSP = (item) => {
    setSpToDelete(item);
    onDeleteOpen();
  };

  const confirmDeleteSP = () => {
    if (!spToDelete) return;

    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/delete/sp`, {
        id: spToDelete.id,
      })
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Surat Pesanan berhasil dihapus.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        onDeleteClose();
        setSpToDelete(null);
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message || "Gagal menghapus Surat Pesanan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };
  async function fetchSeed() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/get/seed/${
          user[0]?.unitKerja_profile.id
        }`
      )
      .then((res) => {
        console.log(res.data);
        setDataSeed(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataDokumen() {
    setIsLoading(true);
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/get?time=${time}&page=${page}&limit=${limit}&unitKerjaId=${unitKerjaFilterId}&pegawaiId=${pegawaiFilterId}&startDate=${tanggalAwal}&endDate=${tanggalAkhir}&subKegPerId=${subKegPerFilterId}&indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja?.id
        }`
      )
      .then((res) => {
        setDataDokumen(res.data.result);
        // Jangan set page dari response, biarkan dikontrol oleh user
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal memuat data dokumen",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/get/download`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
          // headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-nomor-dokumen.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };

  function inputHandler(event, field) {
    const tes = setTimeout(() => {
      const { value } = event.target;

      setNomorPlat(value);
    }, 2000);
  }
  useEffect(() => {
    fetchDataDokumen();
    fetchSeed();
  }, [
    page,
    limit,
    unitKerjaFilterId,
    pegawaiFilterId,
    nomorPlat,
    tanggalAkhir,
    tanggalAwal,
    subKegPerFilterId,
  ]);
  return (
    <>
      <LayoutAset>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"} pt={"30px"}>
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"10px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="sm"
          >
            {/* Header Section */}
            <Flex
              justify="space-between"
              align="center"
              mb={"30px"}
              flexWrap="wrap"
              gap={4}
            >
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="gray.700">
                  Daftar Dokumen Barjas
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Total: {rows} dokumen
                </Text>
              </VStack>
              <HStack gap={3}>
                <Button
                  onClick={onTambahOpen}
                  variant={"primary"}
                  px={"30px"}
                  size="md"
                  leftIcon={<Text fontSize="lg">+</Text>}
                >
                  Tambah Dokumen
                </Button>
                <Button
                  variant={"outline"}
                  onClick={downloadExcel}
                  leftIcon={<BsDownload />}
                  size="md"
                >
                  Export Excel
                </Button>
              </HStack>
            </Flex>

            <Divider mb={"30px"} />

            {/* Filter Section */}
            <Box mb={"30px"}>
              <Heading size="md" mb={"20px"} color="gray.700">
                Filter Pencarian
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
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

                        const filtered = res.data.result;

                        return filtered.map((val) => ({
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
                      setUnitKerjaFilterId(selectedOption.value);
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
                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Sub Kegiatan
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/barjas/get/sub-kegiatan/search?q=${inputValue}&indukUnitKerjaId=${
                            user[0]?.unitKerja_profile?.id
                          }`
                        );

                        const filtered = res.data.result;

                        return filtered.map((val) => ({
                          value: val.id,
                          label: val.nama,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Sub Kegiatan"
                    onChange={(selectedOption) => {
                      setSubKegPerFilterId(selectedOption.value);
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
              </SimpleGrid>
              {(unitKerjaFilterId || subKegPerFilterId) && (
                <Button
                  mt={4}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setUnitKerjaFilterId(0);
                    setSubKegPerFilterId(null);
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </Box>

            <Divider mb={"30px"} />

            {/* Table Section */}
            <Box
              borderRadius="8px"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
            >
              <Table variant="simple" size="md">
                <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Nomor SP
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Tanggal
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Bidang
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Sub Kegiatan
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Akun Belanja
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Rekanan
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize" isNumeric>
                      Nominal
                    </Th>
                    <Th
                      fontWeight="bold"
                      textTransform="capitalize"
                      textAlign="center"
                    >
                      Aksi
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <Tr key={index}>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                      </Tr>
                    ))
                  ) : DataDokumen?.length > 0 ? (
                    DataDokumen?.map((item, index) => (
                      <Tr
                        key={item.id}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "gray.50",
                        }}
                        transition="all 0.2s"
                      >
                        <Td>
                          <Text fontWeight="medium">{item?.nomor || "-"}</Text>
                        </Td>
                        <Td>
                          {item?.tanggal
                            ? new Date(item?.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {item?.subKegPer?.daftarUnitKerja?.unitKerja || "-"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2}>
                            {item?.subKegPer?.nama || "-"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2}>
                            {item?.akunBelanja?.akun || "-"}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {item?.rekanan?.nama || "-"}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold" color="green.600">
                            Rp{" "}
                            {item?.barjas && item.barjas.length > 0
                              ? item.barjas
                                  .reduce(
                                    (total, barja) =>
                                      total +
                                      (barja.harga || 0) * (barja.jumlah || 0),
                                    0
                                  )
                                  .toLocaleString("id-ID")
                              : "0"}
                          </Text>
                        </Td>
                        <Td textAlign="center">
                          <HStack spacing={2} justify="center">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() =>
                                history.push(`/barjas/detail-sp/${item.id}`)
                              }
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteSP(item)}
                              leftIcon={<Icon as={FaTrash} />}
                            >
                              Hapus
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={10}>
                        <VStack spacing={2}>
                          <Text fontSize="lg" color="gray.500">
                            Tidak ada data dokumen
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Klik tombol "Tambah Dokumen" untuk menambahkan data
                            baru
                          </Text>
                        </VStack>
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

          <Modal
            closeOnOverlayClick={false}
            isOpen={isTambahOpen}
            onClose={() =>
              handleCloseModal(() => formikRefTambahSP.current?.resetForm())
            }
          >
            <ModalOverlay />
            <ModalContent borderRadius={0} maxWidth="1200px">
              <Formik
                innerRef={formikRefTambahSP}
                initialValues={initialValuesTambahSP}
                validationSchema={validationSchemaTambahSP}
                onSubmit={submitTambahSP}
                enableReinitialize
                validateOnBlur={true}
                validateOnChange={true}
              >
                {(formik) => (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const keys = Object.keys(initialValuesTambahSP);
                      const touched = {};
                      keys.forEach((k) => {
                        touched[k] = true;
                      });
                      formik.setTouched(touched);
                      formik.handleSubmit(e);
                    }}
                  >
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton
                      onClick={() => handleCloseModal(formik.resetForm)}
                    />

                    <ModalBody>
                      <Box>
                        <HStack mb={6} spacing={3}>
                          <Box
                            bgColor={"aset"}
                            width={"4px"}
                            height={"30px"}
                            borderRadius="2px"
                          ></Box>
                          <Heading size="lg" color={"aset"}>
                            Buat Nomor Surat Pesanan
                          </Heading>
                        </HStack>

                        <SimpleGrid
                          columns={{ base: 1, md: 2 }}
                          spacing={6}
                          p={"20px"}
                        >
                          <FormControl
                            isInvalid={
                              (formik.touched.nomorSPId ||
                                formik.touched.nomorSPManual) &&
                              formik.errors.nomorSP
                            }
                          >
                            <FormLabel fontSize={"16px"} fontWeight="medium">
                              Nomor SP
                            </FormLabel>
                            <Select2
                              options={dataSeed?.resultNomorSP?.map((val) => ({
                                value: val.id,
                                label: `${val.nomorSurat}`,
                              }))}
                              placeholder="Contoh: Roda Dua"
                              focusBorderColor="red"
                              value={
                                formik.values.nomorSPId
                                  ? {
                                      value: formik.values.nomorSPId,
                                      label:
                                        dataSeed?.resultNomorSP?.find(
                                          (v) => v.id === formik.values.nomorSPId
                                        )?.nomorSurat || "",
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  "nomorSPId",
                                  selectedOption?.value || null
                                );
                                if (selectedOption) {
                                  formik.setFieldValue("nomorSPManual", "");
                                  formik.setFieldValue("isTulisManualSP", false);
                                }
                              }}
                              isDisabled={formik.values.isTulisManualSP}
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
                              />{" "}
                            <Button
                              mt={4}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              type="button"
                              onClick={() => {
                                if (formik.values.isTulisManualSP) {
                                  formik.setFieldValue("isTulisManualSP", false);
                                  formik.setFieldValue("nomorSPManual", "");
                                  formik.setFieldValue("nomorSPId", null);
                                } else {
                                  formik.setFieldValue("isTulisManualSP", true);
                                  formik.setFieldValue("nomorSPId", null);
                                }
                              }}
                            >
                              {formik.values.isTulisManualSP
                                ? "Batalkan"
                                : "Tulis Manual"}
                            </Button>
                            {formik.values.isTulisManualSP && (
                              <>
                                <Input
                                  mt={4}
                                  height={"50px"}
                                  bgColor={"terang"}
                                  placeholder="Masukkan Nomor SP Manual"
                                  name="nomorSPManual"
                                  value={formik.values.nomorSPManual}
                                  onChange={(e) => {
                                    formik.setFieldValue(
                                      "nomorSPManual",
                                      e.target.value
                                    );
                                    formik.setFieldValue("nomorSPId", null);
                                  }}
                                />
                              </>
                            )}
                            <FormErrorMessage>
                              {formik.errors.nomorSP}
                            </FormErrorMessage>
                          </FormControl>
                          <FormControl
                            isInvalid={
                              formik.touched.rekananId &&
                              formik.errors.rekananId
                            }
                          >
                            <FormLabel fontSize={"16px"} fontWeight="medium">
                              Rekanan
                            </FormLabel>
                            <AsyncSelect
                              loadOptions={async (inputValue) => {
                                if (!inputValue) return [];
                                try {
                                  const res = await axios.get(
                                    `${
                                      import.meta.env.VITE_REACT_APP_API_BASE_URL
                                    }/barjas/get/rekanan/search?q=${inputValue}`
                                  );

                                  const filtered = res.data.result;

                                  return filtered.map((val) => ({
                                    value: val.id,
                                    label: val.nama,
                                  }));
                                } catch (err) {
                                  console.error(
                                    "Failed to load options:",
                                    err.message
                                  );
                                  return [];
                                }
                              }}
                              placeholder="Ketik Nama Rekanan"
                              value={
                                formik.values.rekananId
                                  ? {
                                      value: formik.values.rekananId,
                                      label:
                                        formik.values.rekananLabel || "Rekanan",
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  "rekananId",
                                  selectedOption?.value ?? null
                                );
                                formik.setFieldValue(
                                  "rekananLabel",
                                  selectedOption?.label ?? ""
                                );
                              }}
                              onBlur={() =>
                                formik.setFieldTouched("rekananId", true)
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
                            <FormErrorMessage>
                              {formik.errors.rekananId}
                            </FormErrorMessage>
                            <Button
                              mt={4}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              type="button"
                              onClick={() =>
                                formik.setFieldValue(
                                  "isTambahRekananBaru",
                                  !formik.values.isTambahRekananBaru
                                )
                              }
                            >
                              {formik.values.isTambahRekananBaru
                                ? "Batalkan"
                                : "Tambah Rekanan"}
                            </Button>
                            {formik.values.isTambahRekananBaru && (
                              <>
                                <Flex>
                                  <Input
                                    height={"50px"}
                                    bgColor={"terang"}
                                    me={"10px"}
                                    placeholder="Nama Rekanan Baru"
                                    name="namaRekananBaru"
                                    value={formik.values.namaRekananBaru}
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        "namaRekananBaru",
                                        e.target.value
                                      )
                                    }
                                  />{" "}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    colorScheme="blue"
                                    height={"50px"}
                                    onClick={() =>
                                      tambahRekanan(
                                        formik.values.namaRekananBaru,
                                        formik.setFieldValue
                                      )
                                    }
                                  >
                                    +
                                  </Button>
                                </Flex>
                              </>
                            )}
                          </FormControl>
                          <FormControl
                            isInvalid={
                              formik.touched.subKegPerId &&
                              formik.errors.subKegPerId
                            }
                          >
                            <FormLabel fontSize={"16px"} fontWeight="medium">
                              Sub Kegiatan
                            </FormLabel>
                            <AsyncSelect
                              loadOptions={async (inputValue) => {
                                if (!inputValue) return [];
                                try {
                                  const res = await axios.get(
                                    `${
                                      import.meta.env.VITE_REACT_APP_API_BASE_URL
                                    }/barjas/get/sub-kegiatan/search?q=${inputValue}&indukUnitKerjaId=${
                                      user[0]?.unitKerja_profile?.id
                                    }`
                                  );

                                  const filtered = res.data.result;

                                  return filtered.map((val) => ({
                                    value: val.id,
                                    label: `${val.nama} - ${val.daftarUnitKerja.unitKerja}`,
                                  }));
                                } catch (err) {
                                  console.error(
                                    "Failed to load options:",
                                    err.message
                                  );
                                  return [];
                                }
                              }}
                              placeholder="Ketik Nama Sub Kegiatan"
                              value={
                                formik.values.subKegPerId
                                  ? {
                                      value: formik.values.subKegPerId,
                                      label:
                                        formik.values.subKegPerLabel ||
                                        "Sub Kegiatan",
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  "subKegPerId",
                                  selectedOption?.value ?? null
                                );
                                formik.setFieldValue(
                                  "subKegPerLabel",
                                  selectedOption?.label ?? ""
                                );
                              }}
                              onBlur={() =>
                                formik.setFieldTouched("subKegPerId", true)
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
                            <FormErrorMessage>
                              {formik.errors.subKegPerId}
                            </FormErrorMessage>
                          </FormControl>
                          <FormControl
                            isInvalid={
                              formik.touched.akunBelanjaId &&
                              formik.errors.akunBelanjaId
                            }
                          >
                            <FormLabel fontSize={"16px"} fontWeight="medium">
                              Akun Belanja
                            </FormLabel>
                            <Select2
                              options={dataSeed?.resultAkunBelanja?.map(
                                (val) => ({
                                  value: val.id,
                                  label: `${val.akun}`,
                                })
                              )}
                              placeholder="Pilih Akun Belanja"
                              focusBorderColor="red"
                              value={
                                formik.values.akunBelanjaId
                                  ? {
                                      value: formik.values.akunBelanjaId,
                                      label:
                                        dataSeed?.resultAkunBelanja?.find(
                                          (v) =>
                                            v.id === formik.values.akunBelanjaId
                                        )?.akun || "",
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  "akunBelanjaId",
                                  selectedOption?.value ?? null
                                );
                              }}
                              onBlur={() =>
                                formik.setFieldTouched("akunBelanjaId", true)
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
                            <FormErrorMessage>
                              {formik.errors.akunBelanjaId}
                            </FormErrorMessage>
                          </FormControl>
                          <FormControl
                            isInvalid={
                              formik.touched.tanggal && formik.errors.tanggal
                            }
                          >
                            <FormLabel fontSize={"16px"} fontWeight="medium">
                              Tanggal
                            </FormLabel>
                            <Input
                              bgColor={"terang"}
                              height={"50px"}
                              type="date"
                              name="tanggal"
                              value={formik.values.tanggal}
                              onChange={(e) =>
                                formik.setFieldValue("tanggal", e.target.value)
                              }
                              onBlur={() =>
                                formik.setFieldTouched("tanggal", true)
                              }
                            />
                            <FormErrorMessage>
                              {formik.errors.tanggal}
                            </FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    </ModalBody>

                    <ModalFooter pe={"30px"} pb={"30px"} pt={"20px"}>
                      <HStack spacing={3}>
                        <Button
                          type="button"
                          onClick={() =>
                            handleCloseModal(formik.resetForm)
                          }
                          variant="ghost"
                          colorScheme="gray"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant={"primary"}
                          size="md"
                          isLoading={formik.isSubmitting}
                        >
                          Simpan Surat Pesanan
                        </Button>
                      </HStack>
                    </ModalFooter>
                  </form>
                )}
              </Formik>
            </ModalContent>
          </Modal>

          {/* Modal Konfirmasi Hapus SP */}
          <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
            <ModalOverlay />
            <ModalContent
              bgColor={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="12px"
            >
              <ModalHeader>
                <Flex align="center">
                  <Icon as={FaTrash} color="red.500" mr={2} boxSize={5} />
                  <Heading size="md">Konfirmasi Hapus Surat Pesanan</Heading>
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Text mb={4}>
                  Apakah Anda yakin ingin menghapus Surat Pesanan berikut?
                </Text>
                {spToDelete && (
                  <Box
                    p={4}
                    bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                    borderRadius="8px"
                    mb={4}
                  >
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Nomor SP
                        </Text>
                        <Text fontSize="md" fontWeight="semibold">
                          {spToDelete?.nomor || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Tanggal
                        </Text>
                        <Text fontSize="sm">
                          {spToDelete?.tanggal
                            ? new Date(spToDelete?.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Sub Kegiatan
                        </Text>
                        <Text fontSize="sm" noOfLines={2}>
                          {spToDelete?.subKegPer?.nama || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Rekanan
                        </Text>
                        <Text fontSize="sm">
                          {spToDelete?.rekanan?.nama || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Total Nominal
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="green.600"
                        >
                          Rp{" "}
                          {spToDelete?.barjas && spToDelete.barjas.length > 0
                            ? spToDelete.barjas
                                .reduce(
                                  (total, barja) =>
                                    total +
                                    (barja.harga || 0) * (barja.jumlah || 0),
                                  0
                                )
                                .toLocaleString("id-ID")
                            : "0"}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                )}
                <Text fontSize="sm" color="red.500" fontWeight="medium">
                  ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait
                  Surat Pesanan ini akan ikut terhapus.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                  Batal
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmDeleteSP}
                  leftIcon={<Icon as={FaTrash} />}
                >
                  Hapus
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </LayoutAset>
    </>
  );
}

export default DaftarDokumen;
