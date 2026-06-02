import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";

import "../../Style/pagination.css";
import { useHistory } from "react-router-dom";
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
  FormControl,
  FormLabel,
  FormErrorMessage,
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
  Input,
  useToast,
  useColorMode,
  VStack,
  Divider,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";

function DaftarPengeluaran() {
  const [dataPengeluaran, setDataPengeluaran] = useState([]);
  const history = useHistory();

  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // filter sesuai controller
  const [indukUnitKerjaFilterId, setIndukUnitKerjaFilterId] = useState(0);
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [rekananFilterId, setRekananFilterId] = useState(0);
  const [metodePembayaranFilterId, setMetodePembayaranFilterId] = useState(0);
  const [jenisPengeluaranFilterId, setJenisPengeluaranFilterId] = useState(0);
  const [statusPembayaranFilterId, setStatusPembayaranFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewFotoOpen,
    onOpen: onPreviewFotoOpen,
    onClose: onPreviewFotoClose,
  } = useDisclosure();
  const [previewFotoUrl, setPreviewFotoUrl] = useState("");
  const [selectedPengeluaran, setSelectedPengeluaran] = useState(null);
  const formikRefTambah = useRef(null);

  const initialValuesTambah = {
    tanggal: "",
    jatuhTempo: "",
    deskripsi: "",
    indukUnitKerjaId: null,
    indukUnitKerjaLabel: "",
    unitKerjaId: null,
    unitKerjaLabel: "",
    pegawaiId: null,
    pegawaiLabel: "",
    metodePembayaranId: null,
    jenisPengeluaranId: null,
    statusPembayaranId: null,
    rekananId: null,
    rekananLabel: "",
    nominal: "",
    pic: null,
    fotoExisting: "",
  };
  const tambahRekanan = (namaRekananBaru, setFieldValue) => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/rekanan`,
        { nama: namaRekananBaru },
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
  const validationSchemaTambah = Yup.object().shape({
    tanggal: Yup.string().required("Tanggal wajib diisi"),
    jatuhTempo: Yup.string().nullable(),
    deskripsi: Yup.string().required("Deskripsi wajib diisi"),
    indukUnitKerjaId: Yup.mixed()
      .nullable()
      .required("Induk unit kerja wajib dipilih"),
    unitKerjaId: Yup.mixed().nullable().required("Unit kerja wajib dipilih"),
    pegawaiId: Yup.mixed().nullable().required("Pegawai wajib dipilih"),
    metodePembayaranId: Yup.mixed()
      .nullable()
      .required("Metode pembayaran wajib dipilih"),
    jenisPengeluaranId: Yup.mixed()
      .nullable()
      .required("Jenis pengeluaran wajib dipilih"),
    statusPembayaranId: Yup.mixed()
      .nullable()
      .required("Status pembayaran wajib dipilih"),
    nominal: Yup.number()
      .typeError("Nominal harus angka")
      .positive("Nominal harus lebih dari 0")
      .required("Nominal wajib diisi"),
    rekananId: Yup.mixed().nullable().required("Rekanan wajib dipilih"),
  });

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const isStatusPaid = (item) => {
    const nama = (
      item?.statusPembayaran?.nama ||
      item?.statusPembayaran?.status ||
      ""
    ).toLowerCase();
    return nama === "paid" || nama.includes("lunas");
  };

  const getSisaHariJatuhTempo = (jatuhTempo) => {
    if (!jatuhTempo) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jt = new Date(jatuhTempo);
    if (Number.isNaN(jt.getTime())) return null;
    jt.setHours(0, 0, 0, 0);
    return Math.round((jt - today) / (1000 * 60 * 60 * 24));
  };

  const getRowJatuhTempoStyle = (item) => {
    if (!item?.jatuhTempo || isStatusPaid(item)) return {};

    const sisaHari = getSisaHariJatuhTempo(item.jatuhTempo);
    if (sisaHari === null) return {};

    if (sisaHari <= 1) {
      return {
        bg: colorMode === "dark" ? "red.900" : "red.50",
        _hover: { bg: colorMode === "dark" ? "red.800" : "red.100" },
      };
    }
    if (sisaHari <= 7) {
      return {
        bg: colorMode === "dark" ? "yellow.900" : "yellow.50",
        _hover: { bg: colorMode === "dark" ? "yellow.800" : "yellow.100" },
      };
    }
    return {};
  };

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setPage(0);
  }, [
    indukUnitKerjaFilterId,
    unitKerjaFilterId,
    pegawaiFilterId,
    metodePembayaranFilterId,
    jenisPengeluaranFilterId,
    statusPembayaranFilterId,
    tanggalAwal,
    tanggalAkhir,
    rekananFilterId,
  ]);

  const loadIndukUnitKerjaOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/induk-unit-kerja?q=${encodeURIComponent(inputValue)}`,
      );
      return (res.data.result || []).map((val) => ({
        value: val.id,
        label: val.indukUnitKerja,
      }));
    } catch (err) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/induk-unit-kerja/get`,
        );
        return (res.data.result || [])
          .filter((val) =>
            val.indukUnitKerja
              ?.toLowerCase()
              .includes(inputValue.toLowerCase()),
          )
          .map((val) => ({
            value: val.id,
            label: val.indukUnitKerja,
          }));
      } catch (fallbackErr) {
        console.error("Failed to load induk unit kerja:", fallbackErr.message);
        return [];
      }
    }
  };

  const handleCloseModal = (resetForm) => {
    if (resetForm) resetForm();
    setSelectedPengeluaran(null);
    onTambahClose();
  };

  async function fetchSeed() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get/seed`,
      )
      .then((res) => {
        setDataSeed(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal memuat data seed pengeluaran",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }

  async function fetchDataPengeluaran() {
    setIsLoading(true);
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get?page=${page}&limit=${limit}&indukUnitKerjaId=${indukUnitKerjaFilterId}&unitKerjaId=${unitKerjaFilterId}&pegawaiId=${pegawaiFilterId}&rekananId=${rekananFilterId}&metodePembayaranId=${metodePembayaranFilterId}&jenisPengeluaranId=${jenisPengeluaranFilterId}&statusPembayaranId=${statusPembayaranFilterId}&startDate=${tanggalAwal}&endDate=${tanggalAkhir}`,
      )
      .then((res) => {
        setDataPengeluaran(res.data.result || []);
        setPages(res.data.totalPage || 0);
        setRows(res.data.totalRows || 0);
        console.log(res.data);
      })

      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal memuat data pengeluaran",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setIsLoading(false));
  }

  const submitTambahPengeluaran = async (
    values,
    { resetForm, setSubmitting },
  ) => {
    try {
      const fd = new FormData();
      fd.append("tanggal", values.tanggal);
      if (values.jatuhTempo) fd.append("jatuhTempo", values.jatuhTempo);
      fd.append("deskripsi", values.deskripsi);
      fd.append("indukUnitKerjaId", values.indukUnitKerjaId);
      fd.append("unitKerjaId", values.unitKerjaId);
      fd.append("metodePembayaranId", values.metodePembayaranId);
      fd.append("jenisPengeluaranId", values.jenisPengeluaranId);
      fd.append("nominal", values.nominal);
      fd.append("pegawaiId", values.pegawaiId);
      fd.append("statusPembayaranId", values.statusPembayaranId);
      if (values.rekananId != null && values.rekananId !== "") {
        fd.append("rekananId", String(values.rekananId));
      }

      if (values.pic) fd.append("pic", values.pic);

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/post`,
        fd,
      );

      toast({
        title: "Berhasil!",
        description: "Data pengeluaran berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await fetchDataPengeluaran();
      handleCloseModal(resetForm);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.message || "Gagal menambahkan data pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitEditPengeluaran = async (
    values,
    { resetForm, setSubmitting },
  ) => {
    if (!selectedPengeluaran?.id) return;

    try {
      const fd = new FormData();
      fd.append("tanggal", values.tanggal);
      fd.append("jatuhTempo", values.jatuhTempo || "");
      fd.append("deskripsi", values.deskripsi);
      fd.append("indukUnitKerjaId", values.indukUnitKerjaId);
      fd.append("unitKerjaId", values.unitKerjaId);
      fd.append("metodePembayaranId", values.metodePembayaranId);
      fd.append("jenisPengeluaranId", values.jenisPengeluaranId);
      fd.append("nominal", values.nominal);
      fd.append("pegawaiId", values.pegawaiId);
      fd.append("statusPembayaranId", values.statusPembayaranId);
      fd.append(
        "rekananId",
        values.rekananId != null ? String(values.rekananId) : "",
      );
      if (values.pic) fd.append("pic", values.pic);

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/put/${selectedPengeluaran.id}`,
        fd,
      );

      toast({
        title: "Berhasil!",
        description: "Data pengeluaran berhasil diupdate.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await fetchDataPengeluaran();
      setSelectedPengeluaran(null);
      handleCloseModal(resetForm);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.message || "Gagal mengupdate data pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openTambahModal = () => {
    setSelectedPengeluaran(null);
    onTambahOpen();
  };

  const openEditModal = (item) => {
    setSelectedPengeluaran(item);
    onTambahOpen();
  };

  useEffect(() => {
    fetchSeed();
  }, []);

  useEffect(() => {
    fetchDataPengeluaran();
  }, [
    page,
    limit,
    indukUnitKerjaFilterId,
    unitKerjaFilterId,
    pegawaiFilterId,
    metodePembayaranFilterId,
    jenisPengeluaranFilterId,
    statusPembayaranFilterId,
    tanggalAwal,
    tanggalAkhir,
    rekananFilterId,
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
            {/* Header */}
            <Flex
              justify="space-between"
              align="center"
              mb={"30px"}
              flexWrap="wrap"
              gap={4}
            >
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="gray.700">
                  Daftar Pengeluaran
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Total: {rows} data
                </Text>
              </VStack>
              <HStack gap={3}>
                <Button
                  onClick={openTambahModal}
                  variant={"primary"}
                  px={"30px"}
                  size="md"
                  leftIcon={<Text fontSize="lg">+</Text>}
                >
                  Tambah Pengeluaran
                </Button>
              </HStack>
            </Flex>

            <Divider mb={"30px"} />

            {/* Filter */}
            <Box mb={"30px"}>
              <Heading size="md" mb={"20px"} color="gray.700">
                Filter Pencarian
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Induk Unit Kerja
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={loadIndukUnitKerjaOptions}
                    placeholder="Ketik Nama Induk Unit Kerja"
                    onChange={(selectedOption) => {
                      setIndukUnitKerjaFilterId(selectedOption?.value || 0);
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
                    Unit Kerja
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/unit-kerja?q=${inputValue}`,
                        );
                        return (res.data.result || []).map((val) => ({
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
                      setUnitKerjaFilterId(selectedOption?.value || 0);
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
                    Pegawai
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/search?q=${inputValue}`,
                        );
                        return (res.data.result || []).map((val) => ({
                          value: val.id,
                          label: val.nama || val.name || `Pegawai #${val.id}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Pegawai"
                    onChange={(selectedOption) => {
                      setPegawaiFilterId(selectedOption?.value || 0);
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
                    Rekanan
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/barjas/get/rekanan/search?q=${inputValue}`,
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
                    placeholder="Ketik Nama Rekanan"
                    onChange={(selectedOption) => {
                      setRekananFilterId(selectedOption?.value || 0);
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
                    Metode Pembayaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.resultMetodePembayaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.metode || `Metode #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Metode Pembayaran"
                    onChange={(selectedOption) =>
                      setMetodePembayaranFilterId(selectedOption?.value || 0)
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
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Jenis Pengeluaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.reslutJenisPengeluaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.jenis || `Jenis #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Jenis Pengeluaran"
                    onChange={(selectedOption) =>
                      setJenisPengeluaranFilterId(selectedOption?.value || 0)
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
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Status Pembayaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.resultStatusPembayaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.status || `Status #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Status Pembayaran"
                    onChange={(selectedOption) =>
                      setStatusPembayaranFilterId(selectedOption?.value || 0)
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
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Tanggal Awal
                  </FormLabel>
                  <Input
                    bgColor={"terang"}
                    height={"50px"}
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Tanggal Akhir
                  </FormLabel>
                  <Input
                    bgColor={"terang"}
                    height={"50px"}
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              {(indukUnitKerjaFilterId ||
                unitKerjaFilterId ||
                pegawaiFilterId ||
                rekananFilterId ||
                metodePembayaranFilterId ||
                jenisPengeluaranFilterId ||
                statusPembayaranFilterId ||
                tanggalAwal ||
                tanggalAkhir) && (
                <Button
                  mt={4}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setIndukUnitKerjaFilterId(0);
                    setUnitKerjaFilterId(0);
                    setPegawaiFilterId(0);
                    setRekananFilterId(0);
                    setMetodePembayaranFilterId(0);
                    setJenisPengeluaranFilterId(0);
                    setStatusPembayaranFilterId(0);
                    setTanggalAwal("");
                    setTanggalAkhir("");
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </Box>

            <Divider mb={"30px"} />

            {/* Table */}
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
                      Tanggal
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Jatuh Tempo
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Deskripsi
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Unit Kerja
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Pegawai
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Rekanan
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Metode
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Jenis
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Status
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize" isNumeric>
                      Nominal
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Foto
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Aksi
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 11 }).map((__, i) => (
                          <Td key={i}>
                            <Skeleton height="20px" />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  ) : dataPengeluaran?.length > 0 ? (
                    dataPengeluaran.map((item) => {
                      const rowStyle = getRowJatuhTempoStyle(item);
                      return (
                        <Tr
                          key={item.id}
                          bg={rowStyle.bg}
                          _hover={
                            rowStyle._hover ?? {
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }
                          }
                          transition="all 0.2s"
                        >
                          <Td>
                            {item?.tanggal
                              ? new Date(item?.tanggal).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </Td>
                          <Td>
                            {item?.jatuhTempo
                              ? new Date(item.jatuhTempo).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {item?.deskripsi || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {item?.daftarUnitKerja?.unitKerja || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {item?.pegawai?.nama || "-"}
                            </Text>
                          </Td>{" "}
                          <Td>
                            <Text fontSize="sm">
                              {item?.rekanan?.nama || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="purple" variant="subtle">
                              {item?.metodePembayaran?.nama ||
                                item?.metodePembayaran?.metode ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {item?.jenisPengeluaran?.nama ||
                                item?.jenisPengeluaran?.jenis ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" variant="subtle">
                              {item?.statusPembayaran?.nama ||
                                item?.statusPembayaran?.status ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold" color="green.600">
                              Rp{" "}
                              {Number(item?.nominal || 0).toLocaleString(
                                "id-ID",
                              )}
                            </Text>
                          </Td>
                          <Td>
                            {item?.foto ? (
                              <Image
                                src={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}${item.foto}`}
                                alt="foto pengeluaran"
                                boxSize="56px"
                                objectFit="cover"
                                borderRadius="8px"
                                border="1px solid"
                                borderColor="gray.200"
                                cursor="pointer"
                                onClick={() => {
                                  setPreviewFotoUrl(
                                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${item.foto}`,
                                  );
                                  onPreviewFotoOpen();
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => openEditModal(item)}
                            >
                              Edit
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={11} textAlign="center" py={10}>
                        <VStack spacing={2}>
                          <Text fontSize="lg" color="gray.500">
                            Tidak ada data pengeluaran
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Klik tombol "Tambah Pengeluaran" untuk menambahkan
                            data baru
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

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
      </LayoutAset>

      {/* Modal Preview Foto */}
      <Modal isOpen={isPreviewFotoOpen} onClose={onPreviewFotoClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>Preview Foto Pengeluaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex justify="center">
              <Image
                src={previewFotoUrl}
                alt="preview foto pengeluaran"
                maxH="70vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="8px"
              />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Pengeluaran */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isTambahOpen}
        onClose={() =>
          handleCloseModal(() => formikRefTambah.current?.resetForm())
        }
      >
        <ModalOverlay />
        <ModalContent borderRadius={0} maxWidth="1100px">
          <Formik
            innerRef={formikRefTambah}
            initialValues={
              selectedPengeluaran
                ? {
                    tanggal: selectedPengeluaran?.tanggal
                      ? String(selectedPengeluaran.tanggal).slice(0, 10)
                      : "",
                    jatuhTempo: selectedPengeluaran?.jatuhTempo
                      ? String(selectedPengeluaran.jatuhTempo).slice(0, 10)
                      : "",
                    deskripsi: selectedPengeluaran?.deskripsi || "",
                    indukUnitKerjaId:
                      selectedPengeluaran?.indukUnitKerjaId ??
                      selectedPengeluaran?.indukUnitKerja?.id ??
                      null,
                    indukUnitKerjaLabel:
                      selectedPengeluaran?.indukUnitKerja?.indukUnitKerja || "",
                    unitKerjaId: selectedPengeluaran?.unitKerjaId || null,
                    unitKerjaLabel:
                      selectedPengeluaran?.daftarUnitKerja?.unitKerja || "",
                    pegawaiId: selectedPengeluaran?.pegawaiId || null,
                    pegawaiLabel: selectedPengeluaran?.pegawai?.nama || "",
                    metodePembayaranId:
                      selectedPengeluaran?.metodePembayaranId || null,
                    jenisPengeluaranId:
                      selectedPengeluaran?.jenisPengeluaranId || null,
                    statusPembayaranId:
                      selectedPengeluaran?.statusPembayaranId || null,
                    rekananId:
                      selectedPengeluaran?.rekananId ??
                      selectedPengeluaran?.rekanan?.id ??
                      null,
                    rekananLabel: selectedPengeluaran?.rekanan?.nama || "",
                    nominal: selectedPengeluaran?.nominal || "",
                    pic: null,
                    fotoExisting: selectedPengeluaran?.foto || "",
                  }
                : initialValuesTambah
            }
            validationSchema={validationSchemaTambah}
            onSubmit={
              selectedPengeluaran
                ? submitEditPengeluaran
                : submitTambahPengeluaran
            }
            enableReinitialize
            validateOnBlur={true}
            validateOnChange={true}
          >
            {(formik) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const keys = Object.keys(initialValuesTambah);
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
                        {selectedPengeluaran
                          ? "Edit Pengeluaran"
                          : "Tambah Pengeluaran"}
                      </Heading>
                    </HStack>

                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={6}
                      p={"10px"}
                    >
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
                          onBlur={() => formik.setFieldTouched("tanggal", true)}
                        />
                        <FormErrorMessage>
                          {formik.errors.tanggal}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.jatuhTempo && formik.errors.jatuhTempo
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Jatuh Tempo{" "}
                          <Text as="span" fontWeight="normal" color="gray.500">
                            (opsional)
                          </Text>
                        </FormLabel>
                        <Input
                          bgColor={"terang"}
                          height={"50px"}
                          type="date"
                          name="jatuhTempo"
                          value={formik.values.jatuhTempo}
                          onChange={(e) =>
                            formik.setFieldValue("jatuhTempo", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("jatuhTempo", true)
                          }
                        />
                        <FormErrorMessage>
                          {formik.errors.jatuhTempo}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.nominal && formik.errors.nominal
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Nominal
                        </FormLabel>
                        <Input
                          bgColor={"terang"}
                          height={"50px"}
                          type="number"
                          name="nominal"
                          placeholder="Contoh: 250000"
                          value={formik.values.nominal}
                          onChange={(e) =>
                            formik.setFieldValue("nominal", e.target.value)
                          }
                          onBlur={() => formik.setFieldTouched("nominal", true)}
                        />
                        <FormErrorMessage>
                          {formik.errors.nominal}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.deskripsi && formik.errors.deskripsi
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Deskripsi
                        </FormLabel>
                        <Textarea
                          bgColor={"terang"}
                          name="deskripsi"
                          placeholder="Tulis deskripsi pengeluaran"
                          value={formik.values.deskripsi}
                          onChange={(e) =>
                            formik.setFieldValue("deskripsi", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("deskripsi", true)
                          }
                        />
                        <FormErrorMessage>
                          {formik.errors.deskripsi}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.indukUnitKerjaId &&
                          formik.errors.indukUnitKerjaId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Induk Unit Kerja
                        </FormLabel>
                        <AsyncSelect
                          loadOptions={loadIndukUnitKerjaOptions}
                          placeholder="Ketik Nama Induk Unit Kerja"
                          value={
                            formik.values.indukUnitKerjaId
                              ? {
                                  value: formik.values.indukUnitKerjaId,
                                  label:
                                    formik.values.indukUnitKerjaLabel ||
                                    "Induk Unit Kerja",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "indukUnitKerjaId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "indukUnitKerjaLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("indukUnitKerjaId", true)
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
                          {formik.errors.indukUnitKerjaId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.unitKerjaId &&
                          formik.errors.unitKerjaId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Unit Kerja
                        </FormLabel>
                        <AsyncSelect
                          loadOptions={async (inputValue) => {
                            if (!inputValue) return [];
                            try {
                              const res = await axios.get(
                                `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/unit-kerja?q=${inputValue}`,
                              );
                              return (res.data.result || []).map((val) => ({
                                value: val.id,
                                label: val.unitKerja,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
                              );
                              return [];
                            }
                          }}
                          placeholder="Ketik Nama Unit Kerja"
                          value={
                            formik.values.unitKerjaId
                              ? {
                                  value: formik.values.unitKerjaId,
                                  label:
                                    formik.values.unitKerjaLabel ||
                                    "Unit Kerja",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "unitKerjaId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "unitKerjaLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("unitKerjaId", true)
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
                          {formik.errors.unitKerjaId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.pegawaiId && formik.errors.pegawaiId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Pegawai
                        </FormLabel>
                        <AsyncSelect
                          loadOptions={async (inputValue) => {
                            if (!inputValue) return [];
                            try {
                              const res = await axios.get(
                                `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/search?q=${inputValue}`,
                              );
                              return (res.data.result || []).map((val) => ({
                                value: val.id,
                                label:
                                  val.nama || val.name || `Pegawai #${val.id}`,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
                              );
                              return [];
                            }
                          }}
                          placeholder="Ketik Nama Pegawai"
                          value={
                            formik.values.pegawaiId
                              ? {
                                  value: formik.values.pegawaiId,
                                  label:
                                    formik.values.pegawaiLabel || "Pegawai",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "pegawaiId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "pegawaiLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("pegawaiId", true)
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
                          {formik.errors.pegawaiId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.metodePembayaranId &&
                          formik.errors.metodePembayaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Metode Pembayaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.resultMetodePembayaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.metode || `Metode #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Metode Pembayaran"
                          value={
                            formik.values.metodePembayaranId
                              ? {
                                  value: formik.values.metodePembayaranId,
                                  label:
                                    (
                                      dataSeed?.resultMetodePembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.metodePembayaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.resultMetodePembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.metodePembayaranId,
                                    )?.metode ||
                                    "Metode Pembayaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "metodePembayaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("metodePembayaranId", true)
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
                          {formik.errors.metodePembayaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.jenisPengeluaranId &&
                          formik.errors.jenisPengeluaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Jenis Pengeluaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.reslutJenisPengeluaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.jenis || `Jenis #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Jenis Pengeluaran"
                          value={
                            formik.values.jenisPengeluaranId
                              ? {
                                  value: formik.values.jenisPengeluaranId,
                                  label:
                                    (
                                      dataSeed?.reslutJenisPengeluaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.jenisPengeluaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.reslutJenisPengeluaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.jenisPengeluaranId,
                                    )?.jenis ||
                                    "Jenis Pengeluaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "jenisPengeluaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("jenisPengeluaranId", true)
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
                          {formik.errors.jenisPengeluaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.statusPembayaranId &&
                          formik.errors.statusPembayaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Status Pembayaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.resultStatusPembayaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.status || `Status #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Status Pembayaran"
                          value={
                            formik.values.statusPembayaranId
                              ? {
                                  value: formik.values.statusPembayaranId,
                                  label:
                                    (
                                      dataSeed?.resultStatusPembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.statusPembayaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.resultStatusPembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.statusPembayaranId,
                                    )?.status ||
                                    "Status Pembayaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "statusPembayaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("statusPembayaranId", true)
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
                          {formik.errors.statusPembayaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Foto (opsional)
                        </FormLabel>
                        <Flex gap={4} align="center" flexWrap="wrap">
                          <Box>
                            <Image
                              src={
                                formik.values.pic
                                  ? URL.createObjectURL(formik.values.pic)
                                  : formik.values.fotoExisting
                                    ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${formik.values.fotoExisting}`
                                    : Foto
                              }
                              alt="preview"
                              boxSize="90px"
                              objectFit="cover"
                              borderRadius="8px"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                          </Box>
                          <Box>
                            <Input
                              type="file"
                              accept="image/*"
                              bgColor={"terang"}
                              height={"50px"}
                              p={2}
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                formik.setFieldValue("pic", file);
                              }}
                            />
                            {formik.values.pic && (
                              <Button
                                mt={2}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                type="button"
                                onClick={() =>
                                  formik.setFieldValue("pic", null)
                                }
                              >
                                Hapus Foto
                              </Button>
                            )}
                          </Box>
                        </Flex>
                      </FormControl>{" "}
                      <FormControl
                        isInvalid={
                          formik.touched.rekananId && formik.errors.rekananId
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
                                }/barjas/get/rekanan/search?q=${inputValue}`,
                              );

                              const filtered = res.data.result;

                              return filtered.map((val) => ({
                                value: val.id,
                                label: val.nama,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
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
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "rekananLabel",
                              selectedOption?.label ?? "",
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
                              !formik.values.isTambahRekananBaru,
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
                                    e.target.value,
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
                                    formik.setFieldValue,
                                  )
                                }
                              >
                                +
                              </Button>
                            </Flex>
                          </>
                        )}
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </ModalBody>

                <ModalFooter pe={"30px"} pb={"30px"} pt={"20px"}>
                  <HStack spacing={3}>
                    <Button
                      type="button"
                      onClick={() => handleCloseModal(formik.resetForm)}
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
                      {selectedPengeluaran
                        ? "Update Pengeluaran"
                        : "Simpan Pengeluaran"}
                    </Button>
                  </HStack>
                </ModalFooter>
              </form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DaftarPengeluaran;
