import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import {
  Select as Select2,
  AsyncSelect,
  CreatableSelect,
} from "chakra-react-select";
import {
  Box,
  Text,
  Button,
  Container,
  Heading,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  Image,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Spacer,
  Skeleton,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Center,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";

const hitungDiskonPengeluaran = (item) => {
  const hargaAsli = Number(item?.nominal || 0);
  const tipe = item?.tipeDiskon;
  const nilai = Number(item?.nilaiDiskon || 0);
  if (!tipe || nilai <= 0) {
    return {
      hargaAsli,
      potongan: 0,
      hargaSetelahDiskon: hargaAsli,
      adaDiskon: false,
      labelDiskon: "-",
    };
  }
  const potonganMentah =
    tipe === "persen" ? Math.round((hargaAsli * nilai) / 100) : Math.round(nilai);
  const potongan = Math.min(Math.max(potonganMentah, 0), hargaAsli);
  const nilaiTampil = Number.isInteger(nilai) ? String(nilai) : String(nilai);
  return {
    hargaAsli,
    potongan,
    hargaSetelahDiskon: hargaAsli - potongan,
    adaDiskon: potongan > 0,
    labelDiskon: tipe === "persen" ? `${nilaiTampil}%` : `Rp ${Math.round(nilai).toLocaleString("id-ID")}`,
  };
};

function DetailPengeluaran(props) {
  const id = props.match.params.id;
  const history = useHistory();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFotoUrl, setPreviewFotoUrl] = useState("");
  const {
    isOpen: isPreviewFotoOpen,
    onOpen: onPreviewFotoOpen,
    onClose: onPreviewFotoClose,
  } = useDisclosure();
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isDiskonOpen,
    onOpen: onDiskonOpen,
    onClose: onDiskonClose,
  } = useDisclosure();
  const [tipeDiskon, setTipeDiskon] = useState("nominal");
  const [nilaiDiskon, setNilaiDiskon] = useState("");
  const [savingDiskon, setSavingDiskon] = useState(false);

  const [dataUnitKerja, setDataUnitKerja] = useState([]);
  const [dataSumberDana, setDataSumberDana] = useState([]);
  const [dataSuratPesanan, setDataSuratPesanan] = useState([]);
  const [dataSatuan, setDataSatuan] = useState([]);
  const [dataLaporan, setDataLaporan] = useState([]);
  const [laporanPersediaanId, setLaporanPersediaanId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const [persediaanId, setPersediaanId] = useState(null);
  const [selectedPersediaan, setSelectedPersediaan] = useState(null);
  const [spesifikasi, setSpesifikasi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [harga, setHarga] = useState("");
  const [satuanPersediaanId, setSatuanPersediaanId] = useState(null);
  const [sumberDanaId, setSumberDanaId] = useState(null);
  const [suratPesananId, setSuratPesananId] = useState(null);
  const [nomorPesanan, setNomorPesanan] = useState("");
  const [tanggalBarang, setTanggalBarang] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(Foto);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    isOpen: isAsetOpen,
    onOpen: onAsetOpen,
    onClose: onAsetClose,
  } = useDisclosure();
  const [jenisAsetList, setJenisAsetList] = useState([]);
  const [kondisiAsetList, setKondisiAsetList] = useState([]);
  const [unitKerjaAsetList, setUnitKerjaAsetList] = useState([]);
  const [asetForm, setAsetForm] = useState({
    nama: "",
    kode: "",
    harga: "",
    merek: "",
    spesifikasi: "",
    tanggal: "",
    jenisAsetId: null,
    kondisiAsetId: null,
    unitKerjaId: null,
    penanggungjawabId: null,
    selectedPegawai: null,
  });
  const [asetFile, setAsetFile] = useState(null);
  const [asetPreview, setAsetPreview] = useState(Foto);
  const [asetFileKey, setAsetFileKey] = useState(0);
  const [submittingAset, setSubmittingAset] = useState(false);

  const selectStyles = {
    container: (provided) => ({
      ...provided,
      borderRadius: "6px",
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: "terang",
      border: "0px",
      minHeight: "44px",
    }),
    option: (provided, state) => ({
      ...provided,
      bg: state.isFocused ? "aset" : "white",
      color: state.isFocused ? "white" : "black",
    }),
  };

  const hideSelectIndicators = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  const selectPortalProps = {
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    styles: {
      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
    },
  };

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  const toDateKey = (value) => {
    if (!value) return "";
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    return "";
  };

  const findLaporanByTanggal = (list, tanggal) => {
    const key = toDateKey(tanggal);
    if (!key) return null;
    const matches = (list || []).filter((lap) => {
      const awal = toDateKey(lap.tanggalAwal);
      const akhir = toDateKey(lap.tanggalAkhir);
      return awal && akhir && key >= awal && key <= akhir;
    });
    return matches.find((lap) => lap.status === "buka") || matches[0] || null;
  };

  const laporanOptions = dataLaporan.map((lap) => ({
    value: lap.id,
    label: `${lap.nama} (${formatTanggal(lap.tanggalAwal)} – ${formatTanggal(lap.tanggalAkhir)})`,
  }));

  const getLineNominal = (item) => {
    const dariField = Number(item?.nominal);
    if (dariField > 0) return dariField;
    return Number(item?.jumlah || 0) * Number(item?.hargaSatuan || 0);
  };

  const getStokMasukList = (data) => {
    if (!data) return [];
    const raw = data.stokMasuks ?? data.stokMasuk;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  };

  const fetchDetail = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pengeluaran/get/detail/${id}`,
      );
      setDetail(res.data.result || null);
    } catch (err) {
      console.error(err);
      setDetail(null);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat detail pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (!isTambahOpen) return;
    const match = findLaporanByTanggal(dataLaporan, tanggalBarang);
    setLaporanPersediaanId(match?.id || null);
  }, [isTambahOpen, dataLaporan, tanggalBarang]);

  const resetFormBarang = (data = detail) => {
    const tanggalDefault = data?.tanggal
      ? String(data.tanggal).split("T")[0]
      : "";
    setUnitKerjaId(data?.daftarUnitKerja?.id || data?.unitKerjaId || null);
    setPersediaanId(null);
    setSelectedPersediaan(null);
    setSpesifikasi("");
    setJumlah("");
    setHarga("");
    setSatuanPersediaanId(null);
    setSumberDanaId(null);
    setSuratPesananId(null);
    setNomorPesanan("");
    setLaporanPersediaanId(null);
    setTanggalBarang(tanggalDefault);
    setKeterangan("");
    setSelectedFile(null);
    setPreviewUrl(Foto);
    setFileInputKey((key) => key + 1);
  };

  const loadMasterBarang = async (data = detail) => {
    try {
      const indukId = data?.indukUnitKerja?.id || data?.indukUnitKerjaId;
      const [unitRes, danaRes, satuanRes, suratRes, laporanRes] =
        await Promise.all([
          axios.get(`${apiBaseUrl}/admin/get/unit-kerja`),
          axios.get(`${apiBaseUrl}/admin/get/sumber-dana`),
          axios.get(`${apiBaseUrl}/persediaan/get/satuan`),
          indukId
            ? axios.get(`${apiBaseUrl}/surat-pesanan/get/${indukId}`)
            : Promise.resolve({ data: { result: [] } }),
          axios.get(`${apiBaseUrl}/laporan-persediaan/get?limit=100`),
        ]);
      setDataUnitKerja(unitRes.data.result || []);
      setDataSumberDana(danaRes.data.result || []);
      setDataSatuan(satuanRes.data.result || []);
      setDataSuratPesanan(suratRes.data.result || []);
      setDataLaporan(laporanRes.data.result || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data form tambah barang",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openTambahModal = () => {
    resetFormBarang(detail);
    loadMasterBarang(detail);
    onTambahOpen();
  };

  const handleCloseTambah = () => {
    onTambahClose();
    resetFormBarang(detail);
  };

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size / 1024 > 2048) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const loadPersediaanOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await axios.get(
        `${apiBaseUrl}/persediaan/search?q=${encodeURIComponent(inputValue)}`,
      );
      return (res.data.result || []).map((val) => ({
        value: val.id,
        label: val.nama,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const tambahBarang = async () => {
    if (!unitKerjaId) {
      toast({
        title: "Error",
        description: "Unit kerja harus dipilih",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!persediaanId) {
      toast({
        title: "Error",
        description: "Nama barang harus dipilih",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!laporanPersediaanId) {
      toast({
        title: "Error",
        description:
          "Pilih laporan persediaan. Tanggal barang harus masuk periode laporan agar tampil di detail laporan.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("persediaanId", persediaanId);
    formData.append("spesifikasi", spesifikasi);
    formData.append("jumlah", jumlah || 0);
    formData.append("harga", harga || 0);
    formData.append("tanggal", tanggalBarang);
    formData.append("keterangan", keterangan);
    formData.append("unitKerjaId", unitKerjaId);
    formData.append("pengeluaranId", id);
    formData.append("laporanPersediaanId", laporanPersediaanId);
    if (suratPesananId) formData.append("suratPesananId", suratPesananId);
    if (nomorPesanan) formData.append("nomorPesanan", nomorPesanan);
    if (sumberDanaId) formData.append("sumberDanaId", sumberDanaId);
    if (satuanPersediaanId)
      formData.append("satuanPersediaanId", satuanPersediaanId);
    if (selectedFile) formData.append("pic", selectedFile);

    setSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/persediaan/post/masuk`, formData);
      toast({
        title: "Berhasil",
        description: "Barang berhasil ditambahkan ke pengeluaran ini.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleCloseTambah();
      fetchDetail(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal menyimpan barang",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const setAsetField = (key, value) => {
    setAsetForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAsetForm = (data = detail) => {
    const tanggalDefault = data?.tanggal ? String(data.tanggal).split("T")[0] : "";
    setAsetForm({
      nama: "",
      kode: "",
      harga: "",
      merek: "",
      spesifikasi: "",
      tanggal: tanggalDefault,
      jenisAsetId: null,
      kondisiAsetId: null,
      unitKerjaId: data?.daftarUnitKerja?.id || data?.unitKerjaId || null,
      penanggungjawabId: null,
      selectedPegawai: null,
    });
    setAsetFile(null);
    setAsetPreview(Foto);
    setAsetFileKey((key) => key + 1);
  };

  const loadMasterAset = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/seed`);
      setJenisAsetList(res.data.jenis || []);
      setKondisiAsetList(res.data.kondisi || []);
      setUnitKerjaAsetList(res.data.unitKerja || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data form aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openTambahAset = async () => {
    resetAsetForm(detail);
    loadMasterAset();
    onAsetOpen();
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/kode-berikutnya`);
      setAsetField("kode", res.data.kode || "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseAset = () => {
    onAsetClose();
    resetAsetForm(detail);
  };

  const handleAsetFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size / 1024 > 2048) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setAsetFile(file);
    setAsetPreview(URL.createObjectURL(file));
  };

  const createMasterAset = async (path, nama, setter, field) => {
    try {
      const res = await axios.post(`${apiBaseUrl}${path}`, { nama });
      const created = res.data.result;
      setter((prev) =>
        prev.some((item) => item.id === created.id) ? prev : [...prev, created],
      );
      setAsetField(field, created.id);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menambah pilihan",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const loadPegawaiAset = async (inputValue) => {
    const q = inputValue?.trim();
    if (!q) return [];
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pegawai/search?q=${encodeURIComponent(q)}`,
      );
      return (res.data.result || []).map((item) => ({
        value: item.id,
        label: item.nip ? `${item.nama} — ${item.nip}` : item.nama,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const tambahAset = async () => {
    if (!asetForm.nama.trim() || !asetForm.kode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode aset wajib diisi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (!asetForm.jenisAsetId || !asetForm.kondisiAsetId || !asetForm.unitKerjaId) {
      toast({
        title: "Error",
        description: "Jenis, kondisi, dan unit kerja wajib dipilih",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const data = new FormData();
    data.append("nama", asetForm.nama.trim());
    data.append("kode", asetForm.kode.trim());
    data.append("harga", asetForm.harga || 0);
    data.append("merek", asetForm.merek);
    data.append("spesifikasi", asetForm.spesifikasi);
    data.append("tanggal", asetForm.tanggal);
    data.append("jenisAsetId", asetForm.jenisAsetId);
    data.append("kondisiAsetId", asetForm.kondisiAsetId);
    data.append("unitKerjaId", asetForm.unitKerjaId);
    data.append("pengeluaranId", id);
    if (asetForm.penanggungjawabId)
      data.append("penanggungjawabId", asetForm.penanggungjawabId);
    if (asetFile) data.append("pic", asetFile);

    setSubmittingAset(true);
    try {
      await axios.post(`${apiBaseUrl}/aset/post`, data);
      toast({
        title: "Berhasil",
        description: "Aset berhasil ditambahkan ke pengeluaran ini.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      handleCloseAset();
      fetchDetail(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menyimpan aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmittingAset(false);
    }
  };

  const openDiskon = () => {
    setTipeDiskon(detail?.tipeDiskon || "nominal");
    setNilaiDiskon(
      detail?.nilaiDiskon != null && detail?.nilaiDiskon !== ""
        ? String(Number(detail.nilaiDiskon))
        : "",
    );
    onDiskonOpen();
  };

  const simpanDiskon = async (hapus = false) => {
    setSavingDiskon(true);
    try {
      await axios.post(`${apiBaseUrl}/pengeluaran/diskon/${id}`, hapus
        ? { hapus: true }
        : { tipeDiskon, nilaiDiskon });
      onDiskonClose();
      toast({
        title: "Berhasil",
        description: hapus ? "Diskon dihapus" : "Diskon berhasil disimpan",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      fetchDetail(true);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menyimpan diskon",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSavingDiskon(false);
    }
  };

  const labelPengeluaran = detail
    ? `${detail.deskripsi || "-"} — ${formatTanggal(detail.tanggal)} — ${formatRupiah(detail.nominal)}`
    : "";

  const InfoRow = ({ label, value, valueColor }) => (
    <Flex justify="space-between" align="flex-start" py={1.5} gap={3}>
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        textAlign="right"
        color={valueColor}
        flex={1}
      >
        {value ?? "-"}
      </Text>
    </Flex>
  );

  const cardBg = colorMode === "dark" ? "gray.800" : "white";

  if (loading) {
    return (
      <LayoutAset>
        <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
          <Container maxW="2880px" p={{ base: "16px", md: "30px" }}>
            <Skeleton height="32px" mb={4} />
            <Skeleton height="200px" mb={6} />
            <Skeleton height="120px" />
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  if (!detail) {
    return (
      <LayoutAset>
        <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
          <Container
            maxW="2880px"
            p={{ base: "16px", md: "30px" }}
            bg={cardBg}
            borderRadius="8px"
            textAlign="center"
          >
            <Text mb={4}>Data pengeluaran tidak ditemukan</Text>
            <Button
              variant="primary"
              onClick={() => history.push("/pengeluaran/daftar-pengeluaran")}
            >
              Kembali ke Daftar
            </Button>
          </Container>
        </Box>
      </LayoutAset>
    );
  }

  const stokMasukList = getStokMasukList(detail);
  const asetList = Array.isArray(detail?.asets) ? detail.asets : [];
  const jenisAsetOptions = jenisAsetList.map((item) => ({
    value: item.id,
    label: item.nama,
  }));
  const kondisiAsetOptions = kondisiAsetList.map((item) => ({
    value: item.id,
    label: item.nama,
  }));
  const unitKerjaAsetOptions = unitKerjaAsetList.map((item) => ({
    value: item.id,
    label: item.unitKerja,
  }));
  const totalNominalBarang = stokMasukList.reduce(
    (sum, item) => sum + getLineNominal(item),
    0,
  );
  const infoDiskon = hitungDiskonPengeluaran(detail);
  const nominalPengeluaran = infoDiskon.hargaAsli;
  const previewDiskon = hitungDiskonPengeluaran({
    nominal: detail.nominal,
    tipeDiskon,
    nilaiDiskon,
  });
  const nominalSesuai =
    Math.round(totalNominalBarang) === Math.round(nominalPengeluaran);
  const selisihNominal = Math.abs(totalNominalBarang - nominalPengeluaran);
  const statusLabel =
    detail?.statusPembayaran?.nama || detail?.statusPembayaran?.status || "-";

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
        <Container
          maxW="2880px"
          p={{ base: "16px", md: "30px" }}
          bg={cardBg}
          borderRadius="8px"
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Heading size={{ base: "md", md: "lg" }}>
                Detail Pengeluaran #{detail.id}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {formatTanggal(detail.tanggal)}
              </Text>
            </VStack>
            <Spacer />
            <Button variant="outline" onClick={openDiskon}>
              Atur Diskon
            </Button>
            <Button
              variant="outline"
              onClick={() => history.push("/pengeluaran/daftar-pengeluaran")}
            >
              Kembali
            </Button>
          </Flex>

          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={6}
            mb={8}
            align="flex-start"
          >
            <Box flex={1} w="full">
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Informasi Pengeluaran
              </Text>
              <Box mb={3}>
                <Text fontSize="sm" color="gray.500">
                  Harga Asli
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  textDecoration={infoDiskon.adaDiskon ? "line-through" : "none"}
                  color={infoDiskon.adaDiskon ? "gray.500" : "green.600"}
                >
                  {formatRupiah(infoDiskon.hargaAsli)}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Diskon
                </Text>
                <Text fontSize="md" fontWeight="semibold" color="orange.500">
                  {infoDiskon.adaDiskon
                    ? `${infoDiskon.labelDiskon} (${formatRupiah(infoDiskon.potongan)})`
                    : "-"}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Harga Setelah Diskon
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatRupiah(infoDiskon.hargaSetelahDiskon)}
                </Text>
              </Box>
              <HStack spacing={2} flexWrap="wrap" mb={4}>
                <Badge colorScheme="green" variant="subtle">
                  {statusLabel}
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  {detail?.metodePembayaran?.nama ||
                    detail?.metodePembayaran?.metode ||
                    "-"}
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  {detail?.jenisPengeluaran?.nama ||
                    detail?.jenisPengeluaran?.jenis ||
                    "-"}
                </Badge>
              </HStack>
              <Divider mb={3} />
              <InfoRow label="Deskripsi" value={detail.deskripsi || "-"} />
              <InfoRow label="Tanggal" value={formatTanggal(detail.tanggal)} />
              <InfoRow
                label="Jatuh Tempo"
                value={formatTanggal(detail.jatuhTempo)}
              />
              <InfoRow
                label="Proyek"
                value={detail?.daftarUnitKerja?.unitKerja || "-"}
              />
              <InfoRow
                label="Induk Unit Kerja"
                value={detail?.indukUnitKerja?.nama || "-"}
              />
              <InfoRow label="Pegawai" value={detail?.pegawai?.nama || "-"} />
              <InfoRow label="Rekanan" value={detail?.rekanan?.nama || "-"} />
              {detail?.pic && (
                <InfoRow label="PIC" value={detail.pic} />
              )}
            </Box>

            {detail.foto && (
              <Box flexShrink={0}>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Foto
                </Text>
                <Image
                  src={`${apiBaseUrl}${detail.foto}`}
                  alt="foto pengeluaran"
                  maxW="280px"
                  maxH="280px"
                  objectFit="cover"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  onClick={() => {
                    setPreviewFotoUrl(`${apiBaseUrl}${detail.foto}`);
                    onPreviewFotoOpen();
                  }}
                />
              </Box>
            )}
          </Flex>

          <Divider mb={6} />

          <Flex align="center" mb={4} gap={3} wrap="wrap">
            <Text fontSize="lg" fontWeight="bold">
              Barang Terkait (Stok Masuk)
            </Text>
            <Spacer />
            <Button variant="primary" onClick={openTambahModal}>
              Tambah Barang
            </Button>
          </Flex>

          {stokMasukList.length === 0 ? (
            <Box
              py={8}
              textAlign="center"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="md"
            >
              <Text color="gray.500">Belum ada barang terkait</Text>
            </Box>
          ) : (
            <Box overflowX="auto" borderRadius="8px" border="1px solid" borderColor="gray.200">
              <Table variant="simple" size="sm">
                <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Th>No</Th>
                    <Th>Tanggal</Th>
                    <Th>Proyek</Th>
                    <Th>Nama Barang</Th>
                    <Th>Spesifikasi</Th>
                    <Th isNumeric>Jumlah</Th>
                    <Th>Satuan</Th>
                    <Th isNumeric>Harga Satuan</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stokMasukList.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{formatTanggal(item.tanggal)}</Td>
                      <Td>
                        {item?.daftarUnitKerja?.unitKerja || "-"}
                      </Td>
                      <Td>{item?.persediaan?.nama || "-"}</Td>
                      <Td>{item?.spesifikasi || "-"}</Td>
                      <Td isNumeric>{item?.jumlah ?? "-"}</Td>
                      <Td>{item?.satuanPersediaan?.satuan || "-"}</Td>
                      <Td isNumeric>
                        {formatRupiah(item?.hargaSatuan)}
                      </Td>
                      <Td isNumeric>
                        {formatRupiah(getLineNominal(item))}
                      </Td>
                      <Td>
                        {item?.persediaanId ? (
                          <Link
                            to={`/aset/tracking-persediaan/${item.persediaanId}`}
                          >
                            <Button size="xs" colorScheme="blue" variant="outline">
                              Tracking
                            </Button>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Td colSpan={8} textAlign="right" fontWeight="bold">
                      Total Nominal
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="bold"
                      color={nominalSesuai ? "green.600" : "red.500"}
                    >
                      {formatRupiah(totalNominalBarang)}
                    </Td>
                    <Td />
                  </Tr>
                  <Tr>
                    <Td colSpan={8} textAlign="right" fontSize="sm" color="gray.500">
                      Nominal Pengeluaran
                    </Td>
                    <Td isNumeric fontSize="sm" fontWeight="semibold">
                      {formatRupiah(nominalPengeluaran)}
                    </Td>
                    <Td />
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          )}

          {stokMasukList.length > 0 && (
            <Box
              mt={3}
              p={3}
              borderRadius="md"
              bg={nominalSesuai ? "green.50" : "red.50"}
              border="1px solid"
              borderColor={nominalSesuai ? "green.200" : "red.200"}
            >
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={nominalSesuai ? "green.700" : "red.700"}
              >
                {nominalSesuai
                  ? "Total nominal barang terkait sesuai dengan nominal pengeluaran."
                  : `Total nominal barang terkait tidak sesuai. Selisih: ${formatRupiah(selisihNominal)}`}
              </Text>
            </Box>
          )}

          <Divider my={6} />

          <Flex align="center" mb={4} gap={3} wrap="wrap">
            <Text fontSize="lg" fontWeight="bold">
              Aset Terkait
            </Text>
            <Spacer />
            <Button variant="primary" onClick={openTambahAset}>
              Tambah Aset
            </Button>
          </Flex>

          {asetList.length === 0 ? (
            <Box
              py={8}
              textAlign="center"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="md"
            >
              <Text color="gray.500">Belum ada aset terkait</Text>
            </Box>
          ) : (
            <Box
              overflowX="auto"
              borderRadius="8px"
              border="1px solid"
              borderColor="gray.200"
            >
              <Table variant="simple" size="sm">
                <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Th>No</Th>
                    <Th>Kode</Th>
                    <Th>Nama</Th>
                    <Th>Jenis</Th>
                    <Th>Merek</Th>
                    <Th>Spesifikasi</Th>
                    <Th isNumeric>Harga</Th>
                    <Th>Tanggal</Th>
                    <Th>Kondisi</Th>
                    <Th>Unit Kerja</Th>
                    <Th>Penanggung Jawab</Th>
                    <Th>Foto</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {asetList.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td fontWeight="semibold">{item.kode}</Td>
                      <Td>
                        <Link to={`/aset/detail-aset/${item.id}`}>
                          <Text as="span" color="purple.600" fontWeight="semibold">
                            {item.nama}
                          </Text>
                        </Link>
                      </Td>
                      <Td>{item.jenisAset?.nama || "-"}</Td>
                      <Td>{item.merek || "-"}</Td>
                      <Td maxW="220px">
                        <Text noOfLines={2}>{item.spesifikasi || "-"}</Text>
                      </Td>
                      <Td isNumeric>{formatRupiah(item.harga)}</Td>
                      <Td>{formatTanggal(item.tanggal)}</Td>
                      <Td>{item.kondisiAset?.nama || "-"}</Td>
                      <Td>{item.daftarUnitKerja?.unitKerja || "-"}</Td>
                      <Td>{item.penanggungJawab?.nama || "-"}</Td>
                      <Td>
                        {item.foto ? (
                          <Image
                            src={`${apiBaseUrl}${item.foto}`}
                            alt={item.nama}
                            boxSize="42px"
                            objectFit="cover"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                              setPreviewFotoUrl(`${apiBaseUrl}${item.foto}`);
                              onPreviewFotoOpen();
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Container>
      </Box>

      <Modal
        isOpen={isTambahOpen}
        onClose={handleCloseTambah}
        size="4xl"
        scrollBehavior="inside"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Barang</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Pengeluaran</FormLabel>
              <Input value={labelPengeluaran} isReadOnly bg="terang" />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Laporan Persediaan</FormLabel>
              <Select2
                options={laporanOptions}
                placeholder="Pilih periode laporan"
                value={
                  laporanOptions.find(
                    (opt) => opt.value === laporanPersediaanId,
                  ) || null
                }
                onChange={(selected) =>
                  setLaporanPersediaanId(selected?.value || null)
                }
                components={hideSelectIndicators}
                chakraStyles={selectStyles}
                {...selectPortalProps}
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Barang ini masuk ke detail laporan pada periode dan unit kerja
                yang dipilih.
              </Text>
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={dataUnitKerja.map((val) => ({
                    value: val.id,
                    label: val.unitKerja,
                  }))}
                  placeholder="Pilih unit kerja"
                  value={
                    dataUnitKerja
                      .map((val) => ({
                        value: val.id,
                        label: val.unitKerja,
                      }))
                      .find((opt) => opt.value === unitKerjaId) || null
                  }
                  onChange={(selected) =>
                    setUnitKerjaId(selected?.value || null)
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama Barang</FormLabel>
                <AsyncSelect
                  loadOptions={loadPersediaanOptions}
                  cacheOptions
                  defaultOptions={false}
                  value={selectedPersediaan}
                  placeholder="Ketik nama barang"
                  onChange={(selected) => {
                    setSelectedPersediaan(selected);
                    setPersediaanId(selected?.value || null);
                  }}
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Spesifikasi Barang</FormLabel>
                <Input
                  bg="terang"
                  value={spesifikasi}
                  onChange={(e) => setSpesifikasi(e.target.value)}
                  placeholder="Contoh: Kertas HVS 40g"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Jumlah</FormLabel>
                <Input
                  type="number"
                  bg="terang"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="Contoh: 500"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Satuan</FormLabel>
                <Select2
                  options={dataSatuan.map((val) => ({
                    value: val.id,
                    label: val.satuan,
                  }))}
                  placeholder="Pilih satuan"
                  value={
                    dataSatuan
                      .map((val) => ({ value: val.id, label: val.satuan }))
                      .find((opt) => opt.value === satuanPersediaanId) || null
                  }
                  onChange={(selected) =>
                    setSatuanPersediaanId(selected?.value || null)
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Harga Satuan</FormLabel>
                <Input
                  type="number"
                  bg="terang"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 5000"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Sumber Dana</FormLabel>
                <Select2
                  options={dataSumberDana.map((val) => ({
                    value: val.id,
                    label: val.sumber,
                  }))}
                  placeholder="Pilih sumber dana"
                  value={
                    dataSumberDana
                      .map((val) => ({ value: val.id, label: val.sumber }))
                      .find((opt) => opt.value === sumberDanaId) || null
                  }
                  onChange={(selected) =>
                    setSumberDanaId(selected?.value || null)
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Surat Pesanan</FormLabel>
                <Select2
                  options={dataSuratPesanan.map((val) => ({
                    value: val.id,
                    label: val.nomor,
                  }))}
                  placeholder="Pilih surat pesanan"
                  value={
                    dataSuratPesanan
                      .map((val) => ({ value: val.id, label: val.nomor }))
                      .find((opt) => opt.value === suratPesananId) || null
                  }
                  onChange={(selected) =>
                    setSuratPesananId(selected?.value || null)
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nomor Surat</FormLabel>
                <Input
                  type="number"
                  bg="terang"
                  value={nomorPesanan}
                  onChange={(e) => setNomorPesanan(e.target.value)}
                  placeholder="Contoh: 12"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal</FormLabel>
                <Input
                  type="date"
                  bg="terang"
                  value={tanggalBarang}
                  onChange={(e) => setTanggalBarang(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Keterangan</FormLabel>
                <Input
                  bg="terang"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pembelian rutin"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Foto Barang</FormLabel>
                <Center mb={3}>
                  <Image
                    src={previewUrl}
                    alt="preview foto barang"
                    boxSize="120px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Center>
                <Input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  bg="terang"
                  onChange={handleFile}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseTambah}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={tambahBarang}
              isLoading={submitting}
            >
              Tambah Persediaan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAsetOpen}
        onClose={handleCloseAset}
        size="4xl"
        scrollBehavior="inside"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Aset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Pengeluaran</FormLabel>
              <Input value={labelPengeluaran} isReadOnly bg="terang" />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Kode</FormLabel>
                <Input
                  bg="terang"
                  value={asetForm.kode}
                  onChange={(e) => setAsetField("kode", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input
                  bg="terang"
                  value={asetForm.nama}
                  onChange={(e) => setAsetField("nama", e.target.value)}
                  placeholder="Nama aset"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Jenis Aset</FormLabel>
                <CreatableSelect
                  options={jenisAsetOptions}
                  placeholder="Pilih atau ketik jenis baru"
                  value={
                    jenisAsetOptions.find(
                      (opt) => opt.value === asetForm.jenisAsetId,
                    ) || null
                  }
                  onChange={(opt) =>
                    setAsetField("jenisAsetId", opt?.value || null)
                  }
                  onCreateOption={(nama) =>
                    createMasterAset(
                      "/aset/post/jenis",
                      nama,
                      setJenisAsetList,
                      "jenisAsetId",
                    )
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Kondisi</FormLabel>
                <CreatableSelect
                  options={kondisiAsetOptions}
                  placeholder="Pilih atau ketik kondisi baru"
                  value={
                    kondisiAsetOptions.find(
                      (opt) => opt.value === asetForm.kondisiAsetId,
                    ) || null
                  }
                  onChange={(opt) =>
                    setAsetField("kondisiAsetId", opt?.value || null)
                  }
                  onCreateOption={(nama) =>
                    createMasterAset(
                      "/aset/post/kondisi",
                      nama,
                      setKondisiAsetList,
                      "kondisiAsetId",
                    )
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Merek</FormLabel>
                <Input
                  bg="terang"
                  value={asetForm.merek}
                  onChange={(e) => setAsetField("merek", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Harga</FormLabel>
                <Input
                  type="number"
                  bg="terang"
                  value={asetForm.harga}
                  onChange={(e) => setAsetField("harga", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal</FormLabel>
                <Input
                  type="date"
                  bg="terang"
                  value={asetForm.tanggal}
                  onChange={(e) => setAsetField("tanggal", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={unitKerjaAsetOptions}
                  placeholder="Pilih unit kerja"
                  value={
                    unitKerjaAsetOptions.find(
                      (opt) => opt.value === asetForm.unitKerjaId,
                    ) || null
                  }
                  onChange={(opt) =>
                    setAsetField("unitKerjaId", opt?.value || null)
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Penanggung Jawab</FormLabel>
                <AsyncSelect
                  loadOptions={loadPegawaiAset}
                  cacheOptions
                  defaultOptions={false}
                  isClearable
                  placeholder="Ketik nama pegawai"
                  value={asetForm.selectedPegawai}
                  onChange={(opt) =>
                    setAsetForm((prev) => ({
                      ...prev,
                      selectedPegawai: opt,
                      penanggungjawabId: opt?.value || null,
                    }))
                  }
                  components={hideSelectIndicators}
                  chakraStyles={selectStyles}
                  {...selectPortalProps}
                />
              </FormControl>
              <FormControl gridColumn={{ md: "1 / -1" }}>
                <FormLabel>Spesifikasi</FormLabel>
                <Textarea
                  bg="terang"
                  value={asetForm.spesifikasi}
                  onChange={(e) => setAsetField("spesifikasi", e.target.value)}
                />
              </FormControl>
              <FormControl gridColumn={{ md: "1 / -1" }}>
                <FormLabel>Foto Aset</FormLabel>
                <Center mb={3}>
                  <Image
                    src={asetPreview}
                    alt="preview foto aset"
                    boxSize="120px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Center>
                <Input
                  key={asetFileKey}
                  type="file"
                  accept="image/*"
                  bg="terang"
                  onChange={handleAsetFile}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseAset}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={tambahAset}
              isLoading={submittingAset}
            >
              Simpan Aset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDiskonOpen} onClose={onDiskonClose} size="md" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Atur Diskon</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Jenis Diskon</FormLabel>
              <RadioGroup value={tipeDiskon} onChange={setTipeDiskon}>
                <HStack spacing={6}>
                  <Radio value="nominal" colorScheme="purple">
                    Nominal
                  </Radio>
                  <Radio value="persen" colorScheme="purple">
                    Persentase
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>
                {tipeDiskon === "persen" ? "Persentase Diskon" : "Nominal Diskon"}
              </FormLabel>
              <Input
                type="number"
                min="0"
                step={tipeDiskon === "persen" ? "0.01" : "1"}
                bg="terang"
                value={nilaiDiskon}
                onChange={(e) => setNilaiDiskon(e.target.value)}
                placeholder={tipeDiskon === "persen" ? "Contoh: 10" : "Contoh: 50000"}
              />
            </FormControl>
            <Box bg="gray.50" borderRadius="md" p={3}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.500">
                  Harga Asli
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {formatRupiah(previewDiskon.hargaAsli)}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.500">
                  Potongan
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="orange.500">
                  {previewDiskon.adaDiskon
                    ? formatRupiah(previewDiskon.potongan)
                    : "-"}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Harga Setelah Diskon
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">
                  {formatRupiah(previewDiskon.hargaSetelahDiskon)}
                </Text>
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            {infoDiskon.adaDiskon && (
              <Button
                variant="ghost"
                colorScheme="red"
                mr="auto"
                onClick={() => simpanDiskon(true)}
                isLoading={savingDiskon}
              >
                Hapus Diskon
              </Button>
            )}
            <Button variant="ghost" mr={3} onClick={onDiskonClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => simpanDiskon(false)}
              isLoading={savingDiskon}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPreviewFotoOpen} onClose={onPreviewFotoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Foto Pengeluaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image
              src={previewFotoUrl}
              alt="preview foto pengeluaran"
              w="full"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAset>
  );
}

export default DetailPengeluaran;
