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
  Checkbox,
  Badge,
  VStack,
  Divider,
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
import { BsPencil } from "react-icons/bs";
function DetailKwitansiGlobal(props) {
  const [dataKwitGlobal, setDataKwitGlobal] = useState([]);
  const history = useHistory();
  const [isPrinting, setIsPrinting] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const [pegawaiId, setPegawaiId] = useState(0);
  const [bendaharaId, setBendaharaId] = useState(null);
  const [KPAId, setKPAId] = useState(null);
  const [jenisPerjalananId, setJenisPerjalananId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataPerjalanan, setDataPerjalanan] = useState(null);
  const [selectedPerjalanan, setSelectedPerjalanan] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [subKegiatanList, setSubKegiatanList] = useState([]);
  const [selectedSubKegiatanId, setSelectedSubKegiatanId] = useState(null);
  const [selectedJenisPerjalananId, setSelectedJenisPerjalananId] =
    useState(null);

  // State untuk edit kwitansi global
  const [editPegawaiId, setEditPegawaiId] = useState(0);
  const [editBendaharaId, setEditBendaharaId] = useState(null);
  const [editKPAId, setEditKPAId] = useState(null);
  const [editJenisPerjalananId, setEditJenisPerjalananId] = useState(null);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [dataKPA, setDataKPA] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState(null);
  const [dataTemplate, setDataTemplate] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  // Sinkronkan selectedIds dengan selectedPerjalanan
  useEffect(() => {
    const ids = Object.keys(selectedPerjalanan)
      .filter((id) => !!selectedPerjalanan[id])
      .map((id) => Number(id));
    setSelectedIds(ids);
  }, [selectedPerjalanan]);
  const user = useSelector(userRedux);
  
  // Cek apakah user memiliki keuangan nonaktif
  const isKeuanganNonaktif =
    user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan === "nonaktif";
  
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isEditSubKegiatanOpen,
    onOpen: onEditSubKegiatanOpen,
    onClose: onEditSubKegiatanClose,
  } = useDisclosure();
  const {
    isOpen: isModalBaruOpen,
    onOpen: onModalBaruOpen,
    onClose: onModalBaruClose,
  } = useDisclosure();
  const {
    isOpen: isEditKwitansiOpen,
    onOpen: onEditKwitansiOpen,
    onClose: onEditKwitansiClose,
  } = useDisclosure();

  async function fetchKwitansiGlobal() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get/detail/${props.match.params.id}`
      )
      .then((res) => {
        setDataKwitGlobal(res.data.result);
        setSubKegiatanList(res.data.resultSubKegiatan || []);
        // Set subKegiatanId yang aktif dari dataKwitGlobal
        if (res.data.result && res.data.result[0]?.subKegiatanId) {
          setSelectedSubKegiatanId(res.data.result[0].subKegiatanId);
        }
        // Set jenisPerjalananId yang aktif dari dataKwitGlobal
        if (res.data.result && res.data.result[0]?.jenisPerjalananId) {
          setSelectedJenisPerjalananId(res.data.result[0].jenisPerjalananId);
        }
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const fetchAllPerjalanan = () => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get/all-perjalanan/${props.match.params.id}`
      )
      .then((res) => {
        setDataPerjalanan(res.data.result);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const tambahPerjalanan = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/add-perjalanan`,
        {
          selectedIds,
          id: props.match.params.id,
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
        onDetailClose();
        fetchKwitansiGlobal();
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
        onDetailClose();
      });
  };

  const ajukan = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/ajukan/${props.match.params.id}`
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
      });
  };

  const kirimDataTabel = () => {
    const kg = Array.isArray(dataKwitGlobal)
      ? dataKwitGlobal[0]
      : dataKwitGlobal;
    if (!kg) {
      toast({
        title: "Error!",
        description: "Data belum tersedia",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const perjalanans = Array.isArray(kg.perjalanans) ? kg.perjalanans : [];
    const parseNumber = (val) => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]/g, "");
        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    const formatTanggalList = (tempats = []) =>
      tempats
        .map((t) => t?.tanggalBerangkat)
        .filter(Boolean)
        .map((d) => new Date(d))
        .map((d) => (isNaN(d) ? null : d))
        .filter(Boolean)
        .map((d) => d.toLocaleDateString("id-ID"))
        .join(", ");

    const formatTempatList = (tempats = []) =>
      tempats
        .map((t) => {
          const tempatStr = t?.tempat || "";
          if (tempatStr.toLowerCase() === "dalam kota") {
            return t?.dalamKota?.nama || "Dalam Kota";
          }
          return tempatStr;
        })
        .filter(Boolean)
        .join(", ");

    const dataTabel = perjalanans.flatMap((perj) => {
      const personils = Array.isArray(perj.personils) ? perj.personils : [];
      const tanggalStr = formatTanggalList(perj.tempats || []);
      const tempatStr = formatTempatList(perj.tempats || []);

      return personils.map((p, index) => {
        const subtotal = (p.rincianBPDs || []).reduce((acc, r) => {
          const nilai = parseNumber(r?.nilai);
          const qty = r?.qty == null ? 1 : parseNumber(r?.qty);
          return acc + nilai * qty;
        }, 0);

        return {
          no: 1 + index,
          nama: p.pegawai?.nama || "-",
          BPD: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(subtotal),
          subtotal: subtotal, // Simpan nilai numerik untuk perhitungan totalFE
          tujuan: tempatStr || "-",
          tanggal: tanggalStr || "-",
          noSuratTugas: perj.noSuratTugas || "-",
          kegiatan: perj.untuk || "-",
        };
      });
    });

    if (dataTabel.length === 0) {
      toast({
        title: "Error!",
        description: "Tidak ada data untuk dikirim",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(dataTabel);

    // Hitung totalFE dari semua subtotal dalam dataTabel
    const totalFE = dataTabel.reduce((total, item) => {
      return total + (item.subtotal || 0);
    }, 0);
    setIsPrinting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/cetak`,
        {
          data: dataTabel,
          kwitansiGlobalId: props.match.params.id,
          templateId: dataKwitGlobal[0]?.templateKwitGlobalId,
          subKegiatan: dataKwitGlobal[0]?.subKegiatan,
          KPAFE: dataKwitGlobal[0]?.KPA,
          PPTKFE: dataKwitGlobal[0]?.PPTK,
          bendaharaFE: dataKwitGlobal[0]?.bendahara,
          penerima: dataKwitGlobal[0]?.pegawai,
          jenisPerjalananFE: dataKwitGlobal[0]?.jenisPerjalanan,
          totalFE,
          verifikasi: dataKwitGlobal[0]?.verifikasi,
          indukUnitKerjaFE:
            user[0]?.unitKerja_profile.indukUnitKerja.indukUnitKerja,
        },
        {
          responseType: "blob", // Penting untuk file binary
          headers: {
            "Content-Type": "application/json",
            Accept:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        }
      )
      .then((res) => {
        // Buat blob dengan MIME type yang tepat
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `kuitansi_global_${
            props.match.params.id
          }_${new Date().getTime()}.docx`
        );
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        toast({
          title: "Berhasil!",
          description: "File berhasil diunduh.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsPrinting(false);
      })
      .catch((err) => {
        console.error("Error mengirim data:", err);
        toast({
          title: "Error!",
          description: "Gagal mengirim data ke API",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsPrinting(false);
      });
  };

  const hapusSemuaPerjalanan = () => {
    const kg = Array.isArray(dataKwitGlobal)
      ? dataKwitGlobal[0]
      : dataKwitGlobal;
    const perjalanans = Array.isArray(kg?.perjalanans) ? kg.perjalanans : [];
    const semuaId = perjalanans.map((p) => p.id);

    if (semuaId.length === 0) {
      toast({
        title: "Error!",
        description: "Tidak ada perjalanan untuk dihapus.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(semuaId);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/hapus-perjalanan`,
        {
          perjalananIds: semuaId,
          id: props.match.params.id,
        }
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Semua perjalanan berhasil dihapus.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
      })
      .catch((err) => {
        toast({
          title: "Error!",
          description: "Gagal menghapus perjalanan.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const handleUpdateSubKegiatan = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/update-subkegiatan`,
        {
          id: props.match.params.id,
          subKegiatanId: selectedSubKegiatanId,
          jenisPerjalananId: selectedJenisPerjalananId,
        }
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Sub Kegiatan dan Jenis Perjalanan berhasil diupdate.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
        setDataPerjalanan(null);
        onModalBaruClose();
      })
      .catch((err) => {
        toast({
          title: "Error!",
          description: "Gagal update Sub Kegiatan dan Jenis Perjalanan.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        onModalBaruClose();
      });
  };

  // Function untuk fetch data dropdown options untuk edit
  const fetchDropdownOptions = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get?page=0&limit=1&unitKerjaId=${
          user[0]?.unitKerja_profile?.id
        }&indukUnitKerjaId=${user[0]?.unitKerja_profile?.indukUnitKerja?.id}`
      );
      setDataKPA(res?.data?.resultKPA);
      setDataBendahara(res?.data?.resultBendahara);
      setDataJenisPerjalanan(res?.data?.resultJenisPerjalanan);
      setDataTemplate(res.data?.resultTemplate);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal memuat data dropdown.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function untuk load data existing ke form edit
  const loadDataToEdit = () => {
    const kg = Array.isArray(dataKwitGlobal)
      ? dataKwitGlobal[0]
      : dataKwitGlobal;
    if (kg) {
      setEditPegawaiId(kg.pegawaiId || 0);
      setEditKPAId(kg.KPAId || null);
      setEditBendaharaId(kg.bendaharaId || null);
      setEditTemplateId(kg.templateKwitGlobalId || null);

      // Set selected pegawai untuk AsyncSelect
      if (kg.pegawai) {
        setSelectedPegawai({
          value: kg.pegawai.id,
          label: kg.pegawai.nama,
        });
      }
    }
  };

  // Function untuk membuka modal edit
  const handleOpenEdit = () => {
    fetchDropdownOptions();
    loadDataToEdit();
    onEditKwitansiOpen();
  };

  // Function untuk update kwitansi global
  const updateKwitansiGlobal = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kwitansi-global/update`,
        {
          id: props.match.params.id,
          pegawaiId: editPegawaiId,
          KPAId: editKPAId,
          bendaharaId: editBendaharaId,
          templateKwitGlobalId: editTemplateId,
        }
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Kwitansi Global berhasil diupdate.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
        onEditKwitansiClose();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message || "Gagal update Kwitansi Global.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    fetchKwitansiGlobal();
  }, [page]);
  return (
    <>
      <Layout>
        <Box minH={"70vh"} pb={"40px"} px={{ base: "20px", md: "30px" }}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            maxW={"2880px"}
            p={{ base: "20px", md: "30px" }}
            borderRadius={"12px"}
            boxShadow={
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            {/* Header Section */}
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              mb={6}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <Box>
                <Heading size="lg" color="gray.700" mb={2}>
                  Detail Kwitansi Global
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Kelola dan lihat detail kwitansi global perjalanan dinas
                </Text>
              </Box>
              {dataKwitGlobal[0]?.status && (
                <Badge
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="capitalize"
                  colorScheme={
                    dataKwitGlobal[0]?.status === "diterima"
                      ? "green"
                      : dataKwitGlobal[0]?.status === "dibuat"
                      ? "blue"
                      : dataKwitGlobal[0]?.status === "ditolak"
                      ? "red"
                      : "gray"
                  }
                >
                  Status: {dataKwitGlobal[0]?.status}
                </Badge>
              )}
            </Flex>

            {/* Informasi Detail Kwitansi */}
            <Box
              mb={6}
              p={6}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="lg"
              border="1px"
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
            >
              <Heading size="md" color="gray.700" mb={4}>
                Informasi Kwitansi
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Penerima
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.pegawai?.nama || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Sub Kegiatan
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.subKegiatan?.subKegiatan || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Jenis Perjalanan
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.jenisPerjalanan?.jenis || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Kode Rekening
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.subKegiatan?.kodeRekening || ""}
                      {dataKwitGlobal[0]?.jenisPerjalanan?.kodeRekening || ""}
                      {!dataKwitGlobal[0]?.subKegiatan?.kodeRekening &&
                        !dataKwitGlobal[0]?.jenisPerjalanan?.kodeRekening &&
                        "-"}
                    </Text>
                  </Box>
                </VStack>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {dataKwitGlobal[0]?.KPA?.jabatan || "Pengguna Anggaran"}
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.KPA?.pegawai_KPA?.nama || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {dataKwitGlobal[0]?.PPTK?.jabatan || "PPTK"}
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.PPTK?.pegawai_PPTK?.nama || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {dataKwitGlobal[0]?.bendahara?.jabatan || "Bendahara"}
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.bendahara?.pegawai_bendahara?.nama ||
                        "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Jenis Kwitansi
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.templateKwitGlobal?.nama || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Tanggal Dibuat
                    </Text>
                    <Text fontWeight="semibold" color="gray.700">
                      {dataKwitGlobal[0]?.createdAt
                        ? new Date(dataKwitGlobal[0].createdAt).toLocaleString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </Text>
                  </Box>
                </VStack>
              </SimpleGrid>
            </Box>
            {/* Action Buttons */}
            <Box mb={6}>
              <Divider mb={4} />
              <Flex gap={3} wrap="wrap" align="center">
                {(dataKwitGlobal[0]?.status === "diterima" || isKeuanganNonaktif) ? (
                  <Button
                    onClick={kirimDataTabel}
                    variant={"solid"}
                    colorScheme="blue"
                    isLoading={isPrinting}
                    loadingText="Mengunduh..."
                    disabled={isPrinting}
                    leftIcon={<BsFileEarmarkArrowDown />}
                    size="md"
                  >
                    {isPrinting ? "Mengunduh..." : "Download Word"}
                  </Button>
                ) : null}

                {dataKwitGlobal[0]?.status === "dibuat" ||
                dataKwitGlobal[0]?.status === "ditolak" ? (
                  <>
                    <Button
                      onClick={handleOpenEdit}
                      variant={"outline"}
                      colorScheme="orange"
                      leftIcon={<BsPencil />}
                      size="md"
                    >
                      Edit Kwitansi Global
                    </Button>
                    <Button
                      onClick={onDetailOpen}
                      variant={"solid"}
                      colorScheme="green"
                      leftIcon={<BsEyeFill />}
                      size="md"
                    >
                      Tambah Perjalanan
                    </Button>
                  </>
                ) : null}

                {Array.isArray(dataKwitGlobal[0]?.perjalanans) &&
                dataKwitGlobal[0]?.perjalanans.length === 0 ? (
                  <Button
                    onClick={() => {
                      fetchDropdownOptions();
                      onModalBaruOpen();
                    }}
                    colorScheme="purple"
                    variant="solid"
                    leftIcon={<BsEyeFill />}
                    size="md"
                  >
                    Edit Sub Kegiatan
                  </Button>
                ) : null}
              </Flex>
            </Box>
            {(() => {
              const kg = Array.isArray(dataKwitGlobal)
                ? dataKwitGlobal[0]
                : dataKwitGlobal;
              if (!kg) {
                return <Text color="gray.500">Data belum tersedia</Text>;
              }
              const perjalanans = Array.isArray(kg.perjalanans)
                ? kg.perjalanans
                : [];
              const parseNumber = (val) => {
                if (typeof val === "number") return val;
                if (typeof val === "string") {
                  const cleaned = val.replace(/[^0-9.-]/g, "");
                  const num = Number(cleaned);
                  return isNaN(num) ? 0 : num;
                }
                return 0;
              };
              const formatTanggalList = (tempats = []) =>
                tempats
                  .map((t) => t?.tanggalBerangkat)
                  .filter(Boolean)
                  .map((d) => new Date(d))
                  .map((d) => (isNaN(d) ? null : d))
                  .filter(Boolean)
                  .map((d) => d.toLocaleDateString("id-ID"))
                  .join(", ");
              const formatTempatList = (tempats = []) =>
                tempats
                  .map((t) => {
                    const tempatStr = t?.tempat || "";
                    if (tempatStr.toLowerCase() === "dalam kota") {
                      return t?.dalamKota?.nama || "Dalam Kota";
                    }
                    return tempatStr;
                  })
                  .filter(Boolean)
                  .join(", ");
              const rows = perjalanans.flatMap((perj) => {
                const personils = Array.isArray(perj.personils)
                  ? perj.personils
                  : [];
                const tanggalStr = formatTanggalList(perj.tempats || []);
                const tempatStr = formatTempatList(perj.tempats || []);
                return personils.map((p) => {
                  const subtotal = (p.rincianBPDs || []).reduce((acc, r) => {
                    const nilai = parseNumber(r?.nilai);
                    const qty = r?.qty == null ? 1 : parseNumber(r?.qty);
                    return acc + nilai * qty;
                  }, 0);
                  return {
                    noSuratTugas: perj.noSuratTugas || "-",
                    tanggalBerangkat: tanggalStr || "-",
                    tempat: tempatStr || "-",
                    total: subtotal,
                    nama: p.pegawai?.nama || "-",
                    status: p.status,
                    id: p.id,
                  };
                });
              });
              if (rows.length === 0) {
                return (
                  <Box textAlign="center" py={10}>
                    <BsClipboard2Data size={48} color="#CBD5E0" />
                    <Text color="gray.500" mt={4} fontSize="lg">
                      Tidak ada data perjalanan
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Data perjalanan akan muncul setelah ditambahkan
                    </Text>
                  </Box>
                );
              }
              const totalAll = rows.reduce((a, r) => a + (r.total || 0), 0);
              return (
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="gray.700">
                      Data Perjalanan Dinas
                    </Heading>
                    <Badge
                      colorScheme="blue"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {rows.length} Perjalanan
                    </Badge>
                  </Flex>
                  <Box
                    overflowX="auto"
                    borderRadius="lg"
                    border="1px"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                  >
                    <Table variant="simple" size="md">
                      <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                        <Tr>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            Aksi
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            No Surat Tugas
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            Nama Pegawai
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            Tanggal Berangkat
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            Tempat
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            Status
                          </Th>
                          <Th
                            color="gray.600"
                            fontWeight="semibold"
                            isNumeric
                            fontSize="sm"
                          >
                            BPD
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((r, idx) => (
                          <Tr
                            key={idx}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            <Td>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => {
                                  history.push(`/rampung/${r.id}`);
                                }}
                              >
                                Detail
                              </Button>
                            </Td>
                            <Td fontWeight="medium" color="gray.700">
                              {r.noSuratTugas}
                            </Td>
                            <Td color="gray.700">{r.nama}</Td>
                            <Td color="gray.600" fontSize="sm">
                              {r.tanggalBerangkat}
                            </Td>
                            <Td color="gray.600" fontSize="sm">
                              {r.tempat}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  r.status?.statusKuitansi === "selesai"
                                    ? "green"
                                    : r.status?.statusKuitansi === "ditolak"
                                    ? "red"
                                    : "yellow"
                                }
                                fontSize="xs"
                              >
                                {r.status?.statusKuitansi || "-"}
                              </Badge>
                            </Td>
                            <Td
                              isNumeric
                              fontWeight="semibold"
                              color="green.600"
                            >
                              Rp {r.total.toLocaleString("id-ID")}
                            </Td>
                          </Tr>
                        ))}
                        <Tr
                          bg={colorMode === "dark" ? "green.900" : "green.50"}
                          borderTop="2px"
                          borderColor="green.300"
                        >
                          <Td colSpan={6} fontWeight="bold" color="green.700">
                            TOTAL
                          </Td>
                          <Td
                            isNumeric
                            fontWeight="bold"
                            color="green.700"
                            fontSize="lg"
                          >
                            Rp {totalAll.toLocaleString("id-ID")}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              );
            })()}
            {(dataKwitGlobal[0]?.status === "dibuat" ||
              dataKwitGlobal[0]?.status === "ditolak") &&
            dataKwitGlobal[0]?.perjalanans &&
            dataKwitGlobal[0]?.perjalanans[0] ? (
              <Box mt={6} pt={6} borderTop="1px" borderColor="gray.200">
                <Flex justify="center" gap={4} wrap="wrap">
                  <Button
                    variant={"solid"}
                    colorScheme="green"
                    onClick={ajukan}
                    size="lg"
                    px={8}
                    leftIcon={<BsCartPlus />}
                    isDisabled={
                      Array.isArray(dataKwitGlobal[0]?.perjalanans) &&
                      dataKwitGlobal[0]?.perjalanans.some(
                        (perj) =>
                          Array.isArray(perj.personils) &&
                          perj.personils.some(
                            (p) =>
                              p?.statusId === 4 || p?.status?.statusId === 4
                          )
                      )
                    }
                  >
                    Ajukan Kwitansi Global
                  </Button>
                  <Button
                    variant={"outline"}
                    colorScheme="red"
                    onClick={hapusSemuaPerjalanan}
                    size="lg"
                    px={8}
                  >
                    Hapus Semua Perjalanan
                  </Button>
                </Flex>
              </Box>
            ) : null}
            {/* {JSON.stringify(dataKwitGlobal[0].perjalanans[0])} */}
          </Container>
        </Box>

        {/* Modal Detail Kwitansi Global */}
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="6xl"
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent maxH="90vh" borderRadius="xl">
            <ModalHeader
              bg="primary"
              borderTopRadius="xl"
              borderBottom="1px"
              borderColor="gray.200"
            >
              <Flex align="center" gap={3}>
                <BsEyeFill color="white" />
                <Text color="white" fontWeight="semibold">
                  Detail Kwitansi Global
                </Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={6}>
              {/* Form Edit Sub Kegiatan di dalam modal */}

              {dataPerjalanan ? (
                <>
                  {Array.isArray(dataPerjalanan) &&
                    dataPerjalanan.length > 0 &&
                    (() => {
                      // Filter perjalanan yang tidak memiliki statusId 1 atau 4
                      const selectablePerjalanan = dataPerjalanan.filter(
                        (perjalanan) => {
                          if (
                            !perjalanan.personils ||
                            perjalanan.personils.length === 0
                          ) {
                            return true; // Jika tidak ada personil, bisa dipilih
                          }

                          const hasRestricted = perjalanan.personils.some(
                            (personil) => {
                              return (
                                personil?.statusId === 1 ||
                                personil?.statusId === 4
                              );
                            }
                          );

                          return !hasRestricted;
                        }
                      );

                      const selectableIds = selectablePerjalanan.map(
                        (p) => p.id
                      );
                      const areAllSelectableSelected =
                        selectableIds.length > 0 &&
                        selectableIds.every((id) => !!selectedPerjalanan[id]);
                      const selectedCount = selectedIds.length;
                      const isIndeterminate =
                        selectedCount > 0 && !areAllSelectableSelected;

                      return (
                        <Box
                          p={4}
                          bg="green.50"
                          borderRadius="lg"
                          border="1px"
                          borderColor="green.200"
                          mb={6}
                        >
                          <Checkbox
                            isChecked={areAllSelectableSelected}
                            isIndeterminate={isIndeterminate}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                const next = {};
                                selectableIds.forEach(
                                  (id) => (next[id] = true)
                                );
                                setSelectedPerjalanan(next);
                              } else {
                                setSelectedPerjalanan({});
                              }
                            }}
                            colorScheme="green"
                            size="lg"
                          >
                            <Text fontWeight="semibold" color="green.700">
                              Pilih Semua ({selectableIds.length} dari{" "}
                              {dataPerjalanan.length} perjalanan dapat dipilih)
                            </Text>
                          </Checkbox>
                        </Box>
                      );
                    })()}{" "}
                  {dataPerjalanan && dataPerjalanan.length > 0 && (
                    <Box mt={8}>
                      <Heading size="lg" mb={6} color="gray.700">
                        Data Perjalanan Dinas
                      </Heading>

                      {dataPerjalanan.map((perjalanan, index) => {
                        // Fungsi untuk mengecek apakah perjalanan memiliki statusId 1 atau 4
                        const hasRestrictedStatus = () => {
                          if (
                            !perjalanan.personils ||
                            perjalanan.personils.length === 0
                          ) {
                            return false;
                          }

                          const hasRestricted = perjalanan.personils.some(
                            (personil) => {
                              return (
                                personil?.statusId === 1 ||
                                personil?.statusId === 4
                              );
                            }
                          );

                          return hasRestricted;
                        };

                        const isRestricted = hasRestrictedStatus();

                        return (
                          <Box
                            key={perjalanan.id}
                            border="2px"
                            borderColor={isRestricted ? "red.200" : "primary"}
                            borderRadius="xl"
                            p={6}
                            mb={6}
                            bg={isRestricted ? "red.50" : "green.50"}
                            opacity={isRestricted ? 0.7 : 1}
                            boxShadow="sm"
                            _hover={{
                              boxShadow: "md",
                              transform: "translateY(-2px)",
                              transition: "all 0.2s",
                            }}
                          >
                            <Flex mb={3} align="center" justify="space-between">
                              <Text
                                fontWeight="bold"
                                color={isRestricted ? "red.700" : "gray.700"}
                              >
                                Perjalanan #{perjalanan.id}
                                {isRestricted && (
                                  <Text
                                    as="span"
                                    fontSize="sm"
                                    color="red.500"
                                    ml={2}
                                  >
                                    (Tidak dapat dipilih - memiliki status
                                    kuitansi terbatas)
                                  </Text>
                                )}
                              </Text>
                              <Checkbox
                                isChecked={!!selectedPerjalanan[perjalanan.id]}
                                onChange={(e) =>
                                  setSelectedPerjalanan((prev) => ({
                                    ...prev,
                                    [perjalanan.id]: e.target.checked,
                                  }))
                                }
                                colorScheme="green"
                                isDisabled={isRestricted}
                              >
                                Pilih
                              </Checkbox>
                            </Flex>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                              mb={4}
                            ></SimpleGrid>

                            {/* Tabel Personil */}
                            {perjalanan.personils &&
                              perjalanan.personils.length > 0 && (
                                <Box mt={4}>
                                  <Heading size="sm" color="gray.600" mb={3}>
                                    Detail Personil
                                  </Heading>
                                  <Box
                                    overflowX="auto"
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor="gray.200"
                                  >
                                    <Table variant="simple" size="sm">
                                      <Thead bg="gray.100">
                                        <Tr>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Asal
                                          </Th>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Tempat
                                          </Th>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Tanggal Berangkat
                                          </Th>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Nama Pegawai
                                          </Th>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Total Rincian BPD
                                          </Th>
                                          <Th
                                            color="gray.600"
                                            fontWeight="semibold"
                                          >
                                            Status
                                          </Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {perjalanan.personils.map(
                                          (personil) => {
                                            const daftarTempat = (
                                              perjalanan.tempats || []
                                            )
                                              .map((t) => {
                                                const tempatStr =
                                                  t?.tempat || "";
                                                if (
                                                  tempatStr.toLowerCase() ===
                                                  "dalam kota"
                                                ) {
                                                  return (
                                                    t?.dalamKota?.nama ||
                                                    "Dalam Kota"
                                                  );
                                                }
                                                return tempatStr;
                                              })
                                              .filter(Boolean)
                                              .join(", ");
                                            const daftarTanggal = (
                                              perjalanan.tempats || []
                                            )
                                              .map(
                                                (t) =>
                                                  t.tanggalBerangkat ||
                                                  t.tanggal
                                              )
                                              .filter(Boolean)
                                              .map((d) => new Date(d))
                                              .map((d) => (isNaN(d) ? null : d))
                                              .filter(Boolean)
                                              .map((d) =>
                                                d.toLocaleDateString("id-ID")
                                              )
                                              .join(", ");
                                            const parseNumber = (val) => {
                                              if (typeof val === "number")
                                                return val;
                                              if (typeof val === "string") {
                                                const cleaned = val.replace(
                                                  /[^0-9.-]/g,
                                                  ""
                                                );
                                                const num = Number(cleaned);
                                                return isNaN(num) ? 0 : num;
                                              }
                                              return 0;
                                            };
                                            const totalRincian =
                                              typeof personil.total ===
                                                "number" &&
                                              !isNaN(personil.total)
                                                ? personil.total
                                                : (
                                                    personil.rincianBPDs || []
                                                  ).reduce((acc, r) => {
                                                    const nilai = parseNumber(
                                                      r?.nilai
                                                    );
                                                    const qty =
                                                      r?.qty == null
                                                        ? 1
                                                        : parseNumber(r?.qty);
                                                    return acc + nilai * qty;
                                                  }, 0);

                                            return (
                                              <Tr key={personil.id}>
                                                <Td>{perjalanan.asal}</Td>
                                                <Td>{daftarTempat || "-"}</Td>
                                                <Td>{daftarTanggal || "-"}</Td>
                                                <Td>
                                                  {personil.pegawai?.nama ||
                                                    "-"}
                                                </Td>
                                                <Td>
                                                  Rp{" "}
                                                  {totalRincian.toLocaleString(
                                                    "id-ID"
                                                  )}
                                                </Td>
                                                <Td>
                                                  {
                                                    personil?.status
                                                      ?.statusKuitansi
                                                  }
                                                </Td>
                                              </Tr>
                                            );
                                          }
                                        )}
                                      </Tbody>
                                    </Table>
                                  </Box>
                                  <Flex justify="end" mt={3}>
                                    <Button
                                      onClick={() =>
                                        history.push(
                                          `/detail-perjalanan/${perjalanan.id}`
                                        )
                                      }
                                      colorScheme="green"
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<BsEyeFill />}
                                    >
                                      Lihat Detail
                                    </Button>
                                  </Flex>
                                </Box>
                              )}

                            {(!perjalanan.personils ||
                              perjalanan.personils.length === 0) && (
                              <Text color="gray.500" fontStyle="italic">
                                Belum ada personil yang ditambahkan
                              </Text>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  {(!dataPerjalanan || dataPerjalanan.length === 0) && (
                    <Box textAlign="center" py={10}>
                      <BsClipboard2Data size={48} color="#CBD5E0" />
                      <Text color="gray.500" mt={4} fontSize="lg">
                        Belum ada data perjalanan
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        Data perjalanan akan muncul setelah ditambahkan
                      </Text>
                    </Box>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={10}>
                  <Button
                    onClick={fetchAllPerjalanan}
                    variant={"primary"}
                    leftIcon={<BsClipboard2Data />}
                  >
                    Muat Data Perjalanan
                  </Button>
                </Box>
              )}
            </ModalBody>
            <ModalFooter
              bg="gray.50"
              borderTop="1px"
              borderColor="gray.200"
              borderBottomRadius="xl"
            >
              <Flex gap={3} w="full" justify="space-between">
                <Button
                  onClick={onDetailClose}
                  variant="outline"
                  colorScheme="gray"
                >
                  Tutup
                </Button>
                {dataPerjalanan ? (
                  <Button onClick={tambahPerjalanan} variant={"primary"}>
                    Tambah Perjalanan
                  </Button>
                ) : null}
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Baru */}
        <Modal isOpen={isModalBaruOpen} onClose={onModalBaruClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Sub Kegiatan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={8}>
                <FormControl mb={4}>
                  <FormLabel fontWeight="bold">Sub Kegiatan</FormLabel>
                  <Select2
                    options={subKegiatanList.map((sk) => ({
                      value: sk.id,
                      label: `${sk.subKegiatan} (${sk.kodeRekening})`,
                    }))}
                    value={
                      subKegiatanList
                        .map((sk) => ({
                          value: sk.id,
                          label: `${sk.subKegiatan} (${sk.kodeRekening})`,
                        }))
                        .find((opt) => opt.value === selectedSubKegiatanId) ||
                      null
                    }
                    onChange={(opt) =>
                      setSelectedSubKegiatanId(opt?.value || null)
                    }
                    placeholder="Pilih Sub Kegiatan"
                    isClearable
                    isDisabled={
                      !["dibuat", "ditolak"].includes(dataKwitGlobal[0]?.status)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Jenis Perjalanan</FormLabel>
                  <Select2
                    options={dataJenisPerjalanan?.map((val) => ({
                      value: val?.id,
                      label: `${val?.jenis}`,
                    }))}
                    placeholder="Pilih Jenis Perjalanan"
                    focusBorderColor="red"
                    value={
                      dataJenisPerjalanan
                        ?.map((val) => ({
                          value: val?.id,
                          label: `${val?.jenis}`,
                        }))
                        .find(
                          (opt) => opt.value === selectedJenisPerjalananId
                        ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedJenisPerjalananId(
                        selectedOption?.value || null
                      );
                    }}
                    isClearable
                    isDisabled={
                      !["dibuat", "ditolak"].includes(dataKwitGlobal[0]?.status)
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
                        height: "50px",
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
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                variant={"primary"}
                me={"10px"}
                onClick={handleUpdateSubKegiatan}
                isDisabled={
                  !selectedSubKegiatanId ||
                  !["dibuat", "ditolak"].includes(dataKwitGlobal[0]?.status)
                }
              >
                Simpan
              </Button>
              <Button
                variant={"outline"}
                onClick={onModalBaruClose}
                colorScheme="gray"
              >
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Edit Kwitansi Global */}
        <Modal
          closeOnOverlayClick={false}
          isOpen={isEditKwitansiOpen}
          onClose={onEditKwitansiClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="1200px">
            <ModalHeader></ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box>
                <HStack mb={6}>
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"} size="md">
                    Edit Kwitansi Global
                  </Heading>
                </HStack>

                <SimpleGrid columns={2} spacing={6} p={"30px"}>
                  <FormControl>
                    <FormLabel fontSize={"18px"} fontWeight="medium">
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
                      value={selectedPegawai}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setEditPegawaiId(selectedOption.value);
                          setSelectedPegawai(selectedOption);
                        } else {
                          setEditPegawaiId(0);
                          setSelectedPegawai(null);
                        }
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
                          height: "50px",
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
                    <FormLabel fontSize={"18px"} fontWeight="medium">
                      Pengguna Anggaran
                    </FormLabel>
                    <Select2
                      options={dataKPA?.map((val) => ({
                        value: val?.id,
                        label: `${val?.pegawai_KPA?.nama}`,
                      }))}
                      placeholder="Pilih Pengguna Anggaran"
                      focusBorderColor="red"
                      value={
                        dataKPA
                          ?.map((val) => ({
                            value: val?.id,
                            label: `${val?.pegawai_KPA?.nama}`,
                          }))
                          .find((opt) => opt.value === editKPAId) || null
                      }
                      onChange={(selectedOption) => {
                        setEditKPAId(selectedOption?.value || null);
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
                          height: "50px",
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

                  <FormControl>
                    <FormLabel fontSize={"18px"} fontWeight="medium">
                      Bendahara
                    </FormLabel>
                    <Select2
                      options={dataBendahara?.map((val) => ({
                        value: val?.id,
                        label: `${val?.pegawai_bendahara?.nama}`,
                      }))}
                      placeholder="Pilih Bendahara"
                      focusBorderColor="red"
                      value={
                        dataBendahara
                          ?.map((val) => ({
                            value: val?.id,
                            label: `${val?.pegawai_bendahara?.nama}`,
                          }))
                          .find((opt) => opt.value === editBendaharaId) || null
                      }
                      onChange={(selectedOption) => {
                        setEditBendaharaId(selectedOption?.value || null);
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
                          height: "50px",
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

                  <FormControl>
                    <FormLabel fontSize={"18px"} fontWeight="medium">
                      Jenis Kwitansi
                    </FormLabel>
                    <Select2
                      options={dataTemplate?.map((val) => ({
                        value: val?.id,
                        label: `${val?.nama}`,
                      }))}
                      placeholder="Pilih Jenis Kwitansi"
                      focusBorderColor="red"
                      value={
                        dataTemplate
                          ?.map((val) => ({
                            value: val?.id,
                            label: `${val?.nama}`,
                          }))
                          .find((opt) => opt.value === editTemplateId) || null
                      }
                      onChange={(selectedOption) => {
                        setEditTemplateId(selectedOption?.value || null);
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
                          height: "50px",
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

            <ModalFooter pe={"60px"} pb={"30px"} gap={3}>
              <Button onClick={updateKwitansiGlobal} variant={"primary"}>
                Simpan Perubahan
              </Button>
              <Button
                variant={"outline"}
                onClick={onEditKwitansiClose}
                colorScheme="gray"
              >
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Layout>
    </>
  );
}

export default DetailKwitansiGlobal;
