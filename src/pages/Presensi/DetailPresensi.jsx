import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Center,
  Input,
  Button,
  HStack,
  useToast,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useDisclosure,
  Flex,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Divider,
  SimpleGrid,
  useMediaQuery,
  useColorMode,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";

function DetailPresensi() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tanggal = searchParams.get("tanggal");
  const [dataPegawai, setDataPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formByPegawai, setFormByPegawai] = useState({});
  const [savingByPegawai, setSavingByPegawai] = useState({});
  const [editingByPegawai, setEditingByPegawai] = useState({});
  const [isModeBuatPresensi, setIsModeBuatPresensi] = useState(false);
  const [selectedPegawaiIds, setSelectedPegawaiIds] = useState({});
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [modalJam, setModalJam] = useState("");
  const [modalTipeJam, setModalTipeJam] = useState("jamMasuk");
  const [modalUnitKerjaId, setModalUnitKerjaId] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [loadingUnitKerja, setLoadingUnitKerja] = useState(false);
  const [statusPresensiList, setStatusPresensiList] = useState([]);
  const [loadingStatusPresensi, setLoadingStatusPresensi] = useState(false);
  const [searchNamaPegawai, setSearchNamaPegawai] = useState("");
  const {
    isOpen: isModalPresensiOpen,
    onOpen: onOpenModalPresensi,
    onClose: onCloseModalPresensi,
  } = useDisclosure();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const { colorMode } = useColorMode();

  const cardBg = colorMode === "dark" ? "gray.800" : "white";
  const cardBorder = colorMode === "dark" ? "gray.700" : "gray.200";
  const labelColor = colorMode === "dark" ? "gray.400" : "gray.600";
  const valueColor = colorMode === "dark" ? "gray.300" : "gray.700";

  const formattedTanggal = useMemo(() => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    if (Number.isNaN(d.getTime())) return tanggal;
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [tanggal]);

  const formatJam = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatJamInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const mergeTanggalDanJam = (tanggalValue, jamValue) => {
    if (!tanggalValue || !jamValue) return null;
    const safeJam = jamValue.length === 5 ? `${jamValue}:00` : jamValue;
    return new Date(`${tanggalValue}T${safeJam}`);
  };

  const isJamKosong = (value) => value == null || value === "";

  const bisaDipilihBuatPresensi = (pegawai) => {
    const presensi = pegawai?.presensis?.[0];
    if (!presensi) return true;
    return isJamKosong(presensi?.jamMasuk) || isJamKosong(presensi?.jamPulang);
  };

  const handleChangeJam = (pegawaiId, field, value) => {
    setFormByPegawai((prev) => ({
      ...prev,
      [pegawaiId]: {
        ...(prev[pegawaiId] || {}),
        [field]: value,
      },
    }));
  };

  const getStatusPresensiId = (presensi) =>
    presensi?.statusPresensiId ?? presensi?.statusPresensi?.id ?? "";

  const getStatusLabel = (statusObj, presensi) => {
    if (!statusObj || Object.keys(statusObj).length === 0) {
      return presensi ? "Tercatat" : "Belum Presensi";
    }
    return (
      statusObj?.namaStatus ||
      statusObj?.status ||
      statusObj?.nama ||
      (presensi ? "Tercatat" : "")
    );
  };

  const getUnitKerjaLabel = (presensi) => {
    const uk = presensi?.daftarUnitKerja;
    if (!uk) return "-";
    const nama = uk?.unitKerja || uk?.nama || "";
    const kode = uk?.kode || "";
    if (nama && kode) return `${nama} (${kode})`;
    return nama || kode || "-";
  };

  const formatLemburHarianNominal = (value) => {
    if (value == null || value === "") return "-";
    const nominal = Number(value);
    if (Number.isNaN(nominal) || nominal <= 0) return "-";
    return nominal.toLocaleString("id-ID");
  };

  const formatLemburHarianInput = (value) => {
    if (value == null || value === "") return "";
    const nominal = Number(value);
    if (Number.isNaN(nominal)) return "";
    return String(nominal);
  };

  const buildFormFromResult = (result = []) => {
    const initialForm = {};
    result.forEach((pegawai) => {
      const presensi = pegawai?.presensis?.[0];
      initialForm[pegawai?.id] = {
        jamMasuk: formatJamInput(presensi?.jamMasuk),
        jamPulang: formatJamInput(presensi?.jamPulang),
        statusPresensiId: getStatusPresensiId(presensi),
        lemburHarian: formatLemburHarianInput(presensi?.lemburHarian),
        unitKerjaId:
          presensi?.unitKerjaId ?? presensi?.daftarUnitKerja?.id ?? "",
      };
    });
    return initialForm;
  };

  const handleMulaiEdit = async (pegawaiId) => {
    if (unitKerjaList.length === 0) {
      await fetchUnitKerja();
    }
    setEditingByPegawai((prev) => ({ ...prev, [pegawaiId]: true }));
  };

  const getNamaPegawai = (pegawai) =>
    pegawai?.namaPegawai || pegawai?.nama || "";

  const matchesSearchPegawai = (pegawai, query) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return true;

    const nama = getNamaPegawai(pegawai).toLowerCase();
    const nip = (pegawai?.nip || "").toLowerCase();
    const jabatan = (pegawai?.jabatan || "").toLowerCase();

    return (
      nama.includes(trimmed) ||
      nip.includes(trimmed) ||
      jabatan.includes(trimmed)
    );
  };

  const filteredDataPegawai = useMemo(
    () => dataPegawai.filter((p) => matchesSearchPegawai(p, searchNamaPegawai)),
    [dataPegawai, searchNamaPegawai],
  );

  const handleToggleModeBuatPresensi = () => {
    setIsModeBuatPresensi((prev) => {
      const nextMode = !prev;
      if (!nextMode) {
        setSelectedPegawaiIds({});
        setSearchNamaPegawai("");
      }
      return nextMode;
    });
  };

  const handleTogglePilihPegawai = (pegawai, checked) => {
    if (!pegawai?.id || !bisaDipilihBuatPresensi(pegawai)) return;
    setSelectedPegawaiIds((prev) => ({
      ...prev,
      [pegawai.id]: checked,
    }));
  };

  const pegawaiTampilYangBisaDipilih = useMemo(
    () => filteredDataPegawai.filter((p) => bisaDipilihBuatPresensi(p)),
    [filteredDataPegawai],
  );

  const rangkumanUnitKerja = useMemo(() => {
    const counter = new Map();

    const tambah = (key, label) => {
      const existing = counter.get(key);
      if (existing) {
        existing.jumlah += 1;
      } else {
        counter.set(key, { label, jumlah: 1 });
      }
    };

    dataPegawai.forEach((pegawai) => {
      const presensi = pegawai?.presensis?.[0];
      if (!presensi) {
        tambah("__belum_presensi__", "Belum Presensi");
        return;
      }

      const uk = presensi?.daftarUnitKerja;
      const key = String(presensi?.unitKerjaId ?? uk?.id ?? "__tanpa_unit__");
      const label =
        uk || presensi?.unitKerjaId ? getUnitKerjaLabel(presensi) : "Tanpa Unit Kerja";
      tambah(key, label);
    });

    return Array.from(counter.values()).sort((a, b) => {
      if (a.label === "Belum Presensi") return 1;
      if (b.label === "Belum Presensi") return -1;
      return a.label.localeCompare(b.label, "id");
    });
  }, [dataPegawai]);

  const isSemuaTerpilih =
    pegawaiTampilYangBisaDipilih.length > 0 &&
    pegawaiTampilYangBisaDipilih.every((p) => selectedPegawaiIds[p.id]);

  const isSebagianTerpilih =
    pegawaiTampilYangBisaDipilih.some((p) => selectedPegawaiIds[p.id]) &&
    !isSemuaTerpilih;

  const handleTogglePilihSemua = (checked) => {
    if (checked) {
      setSelectedPegawaiIds((prev) => {
        const next = { ...prev };
        pegawaiTampilYangBisaDipilih.forEach((p) => {
          next[p.id] = true;
        });
        return next;
      });
    } else {
      setSelectedPegawaiIds((prev) => {
        const next = { ...prev };
        pegawaiTampilYangBisaDipilih.forEach((p) => {
          delete next[p.id];
        });
        return next;
      });
    }
  };

  const handleKlikBarisPegawai = (pegawai) => {
    if (!isModeBuatPresensi || !bisaDipilihBuatPresensi(pegawai)) return;
    handleTogglePilihPegawai(pegawai, !selectedPegawaiIds[pegawai.id]);
  };

  const getBarisPilihStyle = (bisaDipilih, isSelected) => {
    if (!isModeBuatPresensi || !bisaDipilih) return {};
    return {
      cursor: "pointer",
      bg: isSelected
        ? colorMode === "dark"
          ? "teal.900"
          : "teal.50"
        : undefined,
      _hover: {
        bg: isSelected
          ? colorMode === "dark"
            ? "teal.800"
            : "teal.100"
          : colorMode === "dark"
            ? "gray.700"
            : "gray.50",
      },
      transition: "background 0.15s",
    };
  };

  const handleBatalEdit = (pegawai) => {
    const pegawaiId = pegawai?.id;
    if (!pegawaiId) return;
    const presensi = pegawai?.presensis?.[0];

    setFormByPegawai((prev) => ({
      ...prev,
      [pegawaiId]: {
        jamMasuk: formatJamInput(presensi?.jamMasuk),
        jamPulang: formatJamInput(presensi?.jamPulang),
        statusPresensiId: getStatusPresensiId(presensi),
        lemburHarian: formatLemburHarianInput(presensi?.lemburHarian),
        unitKerjaId:
          presensi?.unitKerjaId ?? presensi?.daftarUnitKerja?.id ?? "",
      },
    }));
    setEditingByPegawai((prev) => ({ ...prev, [pegawaiId]: false }));
  };

  const handleSimpanPresensi = async (pegawai) => {
    const pegawaiId = pegawai?.id;
    if (!pegawaiId || !tanggal) return;

    const form = formByPegawai[pegawaiId] || {};
    const presensi = pegawai?.presensis?.[0];
    const jamMasukDate = mergeTanggalDanJam(tanggal, form.jamMasuk);
    const jamPulangDate = mergeTanggalDanJam(tanggal, form.jamPulang);
    const statusPresensiId = form.statusPresensiId
      ? Number(form.statusPresensiId)
      : null;
    const lemburHarian =
      form.lemburHarian !== "" && form.lemburHarian != null
        ? Math.round(Number(form.lemburHarian))
        : null;
    const unitKerjaId = form.unitKerjaId
      ? Number(form.unitKerjaId)
      : presensi?.unitKerjaId ?? presensi?.daftarUnitKerja?.id ?? null;

    if (
      !jamMasukDate &&
      !jamPulangDate &&
      !statusPresensiId &&
      lemburHarian == null
    ) {
      toast({
        title: "Input belum lengkap",
        description:
          "Isi minimal jam masuk, jam pulang, status presensi, atau lembur harian.",
        status: "warning",
      });
      return;
    }

    if (
      form.lemburHarian !== "" &&
      (Number.isNaN(Number(form.lemburHarian)) || Number(form.lemburHarian) < 0)
    ) {
      toast({
        title: "Nominal lembur tidak valid",
        description: "Masukkan nominal upah lembur yang valid.",
        status: "warning",
      });
      return;
    }

    setSavingByPegawai((prev) => ({ ...prev, [pegawaiId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/post`,
        {
          pegawaiId,
          tanggal,
          jamMasuk: jamMasukDate ? jamMasukDate.toISOString() : null,
          jamPulang: jamPulangDate ? jamPulangDate.toISOString() : null,
          ...(unitKerjaId ? { unitKerjaId } : {}),
          ...(statusPresensiId ? { statusPresensiId } : {}),
          ...(lemburHarian != null ? { lemburHarian } : {}),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      toast({
        title: "Berhasil",
        description: `Presensi ${pegawai?.nama || "-"} berhasil disimpan.`,
        status: "success",
      });

      const refreshed = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/get/daftar-presensi`,
        {
          params: { tanggal },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setDataPegawai(
        Array.isArray(refreshed?.data?.result) ? refreshed.data.result : [],
      );
      setFormByPegawai(
        buildFormFromResult(
          Array.isArray(refreshed?.data?.result) ? refreshed.data.result : [],
        ),
      );

      setEditingByPegawai((prev) => ({ ...prev, [pegawaiId]: false }));
    } catch (error) {
      toast({
        title: "Gagal simpan presensi",
        description:
          error?.response?.data?.message ||
          "Pastikan endpoint simpan presensi sesuai backend.",
        status: "error",
      });
    } finally {
      setSavingByPegawai((prev) => ({ ...prev, [pegawaiId]: false }));
    }
  };

  const getSelectedPegawaiIds = () =>
    Object.keys(selectedPegawaiIds)
      .filter((id) => selectedPegawaiIds[id])
      .filter((id) => {
        const pegawai = dataPegawai.find((p) => String(p?.id) === String(id));
        return pegawai && bisaDipilihBuatPresensi(pegawai);
      });

  const getSelectedPegawaiList = () => {
    const ids = getSelectedPegawaiIds().map(Number);
    return dataPegawai.filter(
      (p) => ids.includes(p?.id) && bisaDipilihBuatPresensi(p),
    );
  };

  const fetchUnitKerja = async () => {
    setLoadingUnitKerja(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setUnitKerjaList(Array.isArray(data?.result) ? data.result : []);
    } catch {
      setUnitKerjaList([]);
      toast({
        title: "Gagal memuat unit kerja",
        status: "error",
      });
    } finally {
      setLoadingUnitKerja(false);
    }
  };

  const handleBukaModalPresensi = async () => {
    if (!tanggal) return;
    const selectedIds = getSelectedPegawaiIds();

    if (selectedIds.length === 0) {
      toast({
        title: "Belum ada pegawai dipilih",
        description: "Pilih minimal satu pegawai untuk dibuatkan presensi.",
        status: "warning",
      });
      return;
    }

    setModalJam("");
    setModalTipeJam("jamMasuk");
    setModalUnitKerjaId("");
    onOpenModalPresensi();
    await fetchUnitKerja();
  };

  const handleKonfirmasiSimpanPresensi = async () => {
    if (!tanggal) return;
    const selectedIds = getSelectedPegawaiIds();

    if (!modalUnitKerjaId) {
      toast({
        title: "Unit kerja belum dipilih",
        description: "Silakan pilih unit kerja terlebih dahulu.",
        status: "warning",
      });
      return;
    }

    if (!modalJam) {
      toast({
        title: "Jam belum diisi",
        description: "Silakan isi jam presensi terlebih dahulu.",
        status: "warning",
      });
      return;
    }

    const jamDate = mergeTanggalDanJam(tanggal, modalJam);
    if (!jamDate) {
      toast({
        title: "Format jam tidak valid",
        status: "warning",
      });
      return;
    }

    const jamIso = jamDate.toISOString();
    const payloads = selectedIds.map((id) => ({
      pegawaiId: Number(id),
      tanggal,
      unitKerjaId: Number(modalUnitKerjaId),
      tipeJam: modalTipeJam,
      jamMasuk: modalTipeJam === "jamMasuk" ? jamIso : null,
      jamPulang: modalTipeJam === "jamPulang" ? jamIso : null,
    }));

    setIsSubmittingBulk(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        payloads.map((payload) =>
          axios.post(
            `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/post`,
            payload,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          ),
        ),
      );

      toast({
        title: "Berhasil",
        description: `${payloads.length} data presensi berhasil disimpan.`,
        status: "success",
      });

      const refreshed = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/get/daftar-presensi`,
        {
          params: { tanggal },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      const result = Array.isArray(refreshed?.data?.result)
        ? refreshed.data.result
        : [];
      setDataPegawai(result);
      setFormByPegawai(buildFormFromResult(result));
      setEditingByPegawai({});
      setSelectedPegawaiIds({});
      setIsModeBuatPresensi(false);
      onCloseModalPresensi();
    } catch (error) {
      toast({
        title: "Gagal simpan presensi",
        description:
          error?.response?.data?.message ||
          "Ada data yang gagal dikirim ke backend.",
        status: "error",
      });
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  useEffect(() => {
    const fetchStatusPresensi = async () => {
      setLoadingStatusPresensi(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/get/status`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        setStatusPresensiList(Array.isArray(data?.result) ? data.result : []);
      } catch {
        setStatusPresensiList([]);
        toast({
          title: "Gagal memuat status presensi",
          status: "error",
        });
      } finally {
        setLoadingStatusPresensi(false);
      }
    };

    fetchStatusPresensi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getDetailPresensi = async () => {
      if (!tanggal) {
        setErrorMessage("Tanggal belum dipilih dari kalender.");
        setDataPegawai([]);
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/get/daftar-presensi`,
          {
            params: { tanggal },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const result = Array.isArray(data?.result) ? data.result : [];
        setDataPegawai(result);
        setFormByPegawai(buildFormFromResult(result));
        setEditingByPegawai({});
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Gagal mengambil detail presensi mingguan.",
        );
        setDataPegawai([]);
      } finally {
        setLoading(false);
      }
    };

    getDetailPresensi();
  }, [tanggal]);

  const CardField = ({ label, children }) => (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" color={labelColor} mb={1}>
        {label}
      </Text>
      <Box fontSize="sm" color={valueColor}>
        {children}
      </Box>
    </Box>
  );

  const renderAksiPegawai = (pegawai, ctx) => {
    const { isEditing, bisaDipilih, isSelected } = ctx;

    if (isModeBuatPresensi) {
      return (
        <Text fontSize="xs" color="gray.500">
          {!bisaDipilih
            ? "Jam masuk & pulang sudah ada"
            : isSelected
              ? "Siap disimpan"
              : "Belum dipilih"}
        </Text>
      );
    }

    if (isEditing) {
      return (
        <Stack direction={{ base: "column", sm: "row" }} spacing={2} w="100%">
          <Button
            size="sm"
            colorScheme="blue"
            isLoading={Boolean(savingByPegawai[pegawai?.id])}
            onClick={() => handleSimpanPresensi(pegawai)}
            flex={{ base: 1, sm: "none" }}
          >
            Simpan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatalEdit(pegawai)}
            isDisabled={Boolean(savingByPegawai[pegawai?.id])}
            flex={{ base: 1, sm: "none" }}
          >
            Batal
          </Button>
        </Stack>
      );
    }

    return (
      <Button
        size="sm"
        colorScheme="yellow"
        variant="outline"
        onClick={() => handleMulaiEdit(pegawai?.id)}
        w={{ base: "100%", md: "auto" }}
      >
        Edit
      </Button>
    );
  };

  const renderPegawaiFields = (pegawai, ctx) => {
    const { presensi, isInputEnabled, statusLabel, formStatusId } = ctx;

    const formUnitKerjaId = formByPegawai[pegawai?.id]?.unitKerjaId ?? "";

    return {
      unitKerja: isInputEnabled ? (
        <Select
          size="sm"
          placeholder={loadingUnitKerja ? "Memuat..." : "Pilih unit kerja"}
          value={formUnitKerjaId}
          onChange={(e) =>
            handleChangeJam(pegawai?.id, "unitKerjaId", e.target.value)
          }
          isDisabled={loadingUnitKerja}
        >
          {unitKerjaList.map((uk) => (
            <option key={uk.id} value={uk.id}>
              {uk.unitKerja || uk.kode || `Unit ${uk.id}`}
            </option>
          ))}
        </Select>
      ) : (
        getUnitKerjaLabel(presensi)
      ),
      jamMasuk: isInputEnabled ? (
        <Input
          size="sm"
          type="time"
          step={1}
          value={formByPegawai[pegawai?.id]?.jamMasuk || ""}
          onChange={(e) =>
            handleChangeJam(pegawai?.id, "jamMasuk", e.target.value)
          }
        />
      ) : (
        formatJam(presensi?.jamMasuk)
      ),
      jamPulang: isInputEnabled ? (
        <Input
          size="sm"
          type="time"
          step={1}
          value={formByPegawai[pegawai?.id]?.jamPulang || ""}
          onChange={(e) =>
            handleChangeJam(pegawai?.id, "jamPulang", e.target.value)
          }
        />
      ) : (
        formatJam(presensi?.jamPulang)
      ),
      status: isInputEnabled ? (
        <Select
          size="sm"
          placeholder={loadingStatusPresensi ? "Memuat..." : "Pilih status"}
          value={formStatusId}
          onChange={(e) =>
            handleChangeJam(pegawai?.id, "statusPresensiId", e.target.value)
          }
          isDisabled={loadingStatusPresensi}
        >
          {statusPresensiList.map((status) => (
            <option key={status.id} value={status.id}>
              {getStatusLabel(status, null) || `Status ${status.id}`}
            </option>
          ))}
        </Select>
      ) : (
        <Badge
          colorScheme={presensi ? "green" : "orange"}
          borderRadius="md"
          px={2}
        >
          {statusLabel}
        </Badge>
      ),
      lembur: isInputEnabled ? (
        <Input
          size="sm"
          type="number"
          min={0}
          step={1}
          placeholder="Nominal lembur"
          value={formByPegawai[pegawai?.id]?.lemburHarian ?? ""}
          onChange={(e) =>
            handleChangeJam(pegawai?.id, "lemburHarian", e.target.value)
          }
        />
      ) : (
        formatLemburHarianNominal(presensi?.lemburHarian)
      ),
    };
  };

  const getPegawaiCtx = (pegawai, index) => {
    const presensi = pegawai?.presensis?.[0] || null;
    const isEditing = Boolean(editingByPegawai[pegawai?.id]);
    const isSelected = Boolean(selectedPegawaiIds[pegawai?.id]);
    const bisaDipilih = bisaDipilihBuatPresensi(pegawai);
    const isInputEnabled = isEditing && !isModeBuatPresensi;
    const statusObj = presensi?.statusPresensi || {};
    const formStatusId = formByPegawai[pegawai?.id]?.statusPresensiId ?? "";
    const statusLabel = getStatusLabel(statusObj, presensi);
    const fields = renderPegawaiFields(pegawai, {
      presensi,
      isInputEnabled,
      statusLabel,
      formStatusId,
    });

    return {
      presensi,
      isEditing,
      isSelected,
      bisaDipilih,
      isInputEnabled,
      statusLabel,
      formStatusId,
      fields,
      index,
    };
  };

  const PegawaiPresensiCard = ({ pegawai, index }) => {
    const ctx = getPegawaiCtx(pegawai, index);
    const {
      presensi,
      isEditing,
      isSelected,
      bisaDipilih,
      statusLabel,
      fields,
    } = ctx;

    return (
      <Card
        mb={4}
        bg={cardBg}
        border="1px solid"
        borderColor={isModeBuatPresensi && isSelected ? "teal.400" : cardBorder}
        borderRadius="12px"
        boxShadow="sm"
        onClick={() => handleKlikBarisPegawai(pegawai)}
        {...getBarisPilihStyle(bisaDipilih, isSelected)}
      >
        <CardHeader pb={3} borderBottom="1px solid" borderColor={cardBorder}>
          <Flex justify="space-between" align="flex-start" gap={3}>
            <VStack align="start" spacing={1} flex={1} minW={0}>
              <HStack spacing={2} w="100%">
                {isModeBuatPresensi ? (
                  !bisaDipilih ? (
                    <Text fontSize="xs" color="gray.500" flexShrink={0}>
                      Jam lengkap
                    </Text>
                  ) : (
                    <Checkbox
                      isChecked={isSelected}
                      pointerEvents="none"
                      flexShrink={0}
                    />
                  )
                ) : null}
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.800"}
                  noOfLines={2}
                >
                  {pegawai?.namaPegawai || pegawai?.nama || "-"}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                No. {index + 1} · NIP {pegawai?.nip || "-"}
              </Text>
            </VStack>
            {!isEditing && !isModeBuatPresensi ? (
              <Badge
                colorScheme={presensi ? "green" : "orange"}
                borderRadius="md"
                px={2}
                flexShrink={0}
              >
                {statusLabel}
              </Badge>
            ) : null}
          </Flex>
        </CardHeader>

        <CardBody pt={4}>
          <VStack align="stretch" spacing={3}>
            <CardField label="Unit Kerja">{fields.unitKerja}</CardField>

            <SimpleGrid columns={2} spacing={3}>
              <CardField label="Jam Masuk">{fields.jamMasuk}</CardField>
              <CardField label="Jam Pulang">{fields.jamPulang}</CardField>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={3}>
              <CardField label="Jam Kerja">
                {presensi?.jamKerja != null
                  ? `${presensi.jamKerja / 60} jam`
                  : "-"}
              </CardField>
              <CardField label="Upah Lembur">{fields.lembur}</CardField>
            </SimpleGrid>

            {isEditing && (
              <CardField label="Status Presensi">{fields.status}</CardField>
            )}

            <Divider borderColor={cardBorder} />

            {renderAksiPegawai(pegawai, ctx)}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  return (
    <LayoutPegawai>
      <Box
        bgColor="secondary"
        pb={{ base: "20px", md: "40px" }}
        px={{ base: "16px", md: "30px" }}
        minH="60vh"
      >
        <Container
          maxW="1280px"
          variant="primary"
          p={{ base: "16px", md: "30px" }}
          my={{ base: "16px", md: "30px" }}
        >
          <VStack align="stretch" spacing={4} mb={4}>
            <Box>
              <Heading size={{ base: "sm", md: "md" }} mb={2}>
                Detail Presensi
              </Heading>
              <Text fontSize={{ base: "sm", md: "md" }}>
                Tanggal dipilih: <b>{formattedTanggal}</b>
              </Text>
            </Box>

            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={3}
              w="100%"
            >
              <Button
                size="sm"
                colorScheme={isModeBuatPresensi ? "red" : "teal"}
                variant={isModeBuatPresensi ? "outline" : "solid"}
                onClick={handleToggleModeBuatPresensi}
                w={{ base: "100%", sm: "auto" }}
              >
                {isModeBuatPresensi ? "Batal Buat Presensi" : "Buat Presensi"}
              </Button>
              {isModeBuatPresensi ? (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleBukaModalPresensi}
                  w={{ base: "100%", sm: "auto" }}
                >
                  Simpan Presensi Terpilih
                </Button>
              ) : null}
            </Stack>

            {!loading && !errorMessage && dataPegawai.length > 0 ? (
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>
                  Cari Pegawai
                </FormLabel>
                <HStack spacing={2}>
                  <Input
                    size="sm"
                    placeholder="Cari nama, NIP, atau jabatan..."
                    value={searchNamaPegawai}
                    onChange={(e) => setSearchNamaPegawai(e.target.value)}
                    bg={cardBg}
                  />
                  {searchNamaPegawai ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearchNamaPegawai("")}
                      flexShrink={0}
                    >
                      Reset
                    </Button>
                  ) : null}
                </HStack>
                {searchNamaPegawai.trim() ? (
                  <Text fontSize="xs" color={labelColor} mt={1}>
                    Menampilkan {filteredDataPegawai.length} dari{" "}
                    {dataPegawai.length} pegawai
                  </Text>
                ) : null}
              </FormControl>
            ) : null}
          </VStack>

          {!loading && !errorMessage && dataPegawai.length > 0 ? (
            <Card
              mb={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="sm"
            >
              <CardHeader pb={2}>
                <Heading size="sm">Rangkuman Pekerja per Unit Kerja</Heading>
                <Text fontSize="sm" color={labelColor} mt={1}>
                  Total {dataPegawai.length} pekerja pada tanggal ini
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing={3}
                >
                  {rangkumanUnitKerja.map((item) => (
                    <Box
                      key={item.label}
                      p={3}
                      border="1px solid"
                      borderColor={cardBorder}
                      borderRadius="md"
                      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    >
                      <Text fontSize="xs" color={labelColor} noOfLines={2}>
                        {item.label}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                        {item.jumlah}
                      </Text>
                      <Text fontSize="xs" color={labelColor}>
                        pekerja
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          ) : null}

          {loading ? (
            <Center py={8}>
              <Spinner />
            </Center>
          ) : errorMessage ? (
            <Text color="red.500">{errorMessage}</Text>
          ) : dataPegawai.length === 0 ? (
            <Center py={12}>
              <Text color="gray.500">Data presensi tidak ditemukan.</Text>
            </Center>
          ) : filteredDataPegawai.length === 0 ? (
            <Center py={12}>
              <VStack spacing={2}>
                <Text color="gray.500">
                  Tidak ada pegawai yang cocok dengan pencarian.
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchNamaPegawai("")}
                >
                  Reset Pencarian
                </Button>
              </VStack>
            </Center>
          ) : isMobile ? (
            <Box>
              {isModeBuatPresensi && pegawaiTampilYangBisaDipilih.length > 0 ? (
                <HStack
                  mb={3}
                  p={3}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleTogglePilihSemua(!isSemuaTerpilih)}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.50",
                  }}
                >
                  <Checkbox
                    isChecked={isSemuaTerpilih}
                    isIndeterminate={isSebagianTerpilih}
                    pointerEvents="none"
                  >
                    Pilih semua ({pegawaiTampilYangBisaDipilih.length})
                  </Checkbox>
                </HStack>
              ) : null}
              {filteredDataPegawai.map((pegawai, index) => (
                <PegawaiPresensiCard
                  key={pegawai?.id || `pegawai-${index}`}
                  pegawai={pegawai}
                  index={index}
                />
              ))}
            </Box>
          ) : (
            <Box overflowX="auto" mx={{ base: -2, md: 0 }}>
              <Table size="sm" variant="simple" minW="960px">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    {isModeBuatPresensi ? (
                      <Th
                        cursor="pointer"
                        onClick={() => handleTogglePilihSemua(!isSemuaTerpilih)}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "gray.50",
                        }}
                      >
                        <Checkbox
                          isChecked={isSemuaTerpilih}
                          isIndeterminate={isSebagianTerpilih}
                          pointerEvents="none"
                          aria-label="Pilih semua pegawai"
                        />
                      </Th>
                    ) : null}
                    <Th>Nama Pegawai</Th>
                    <Th>Jabatan</Th>
                    <Th>Unit Kerja</Th>
                    <Th>Jam Masuk</Th>
                    <Th>Jam Pulang</Th>
                    <Th>Jam Kerja</Th>
                    <Th>Status Presensi</Th>
                    <Th>Upah lembur</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDataPegawai.map((pegawai, index) => {
                    const ctx = getPegawaiCtx(pegawai, index);
                    const { presensi, isSelected, bisaDipilih, fields } = ctx;

                    return (
                      <Tr
                        key={pegawai?.id || `pegawai-${index}`}
                        onClick={() => handleKlikBarisPegawai(pegawai)}
                        {...getBarisPilihStyle(bisaDipilih, isSelected)}
                      >
                        <Td>{index + 1}</Td>
                        {isModeBuatPresensi ? (
                          <Td>
                            {!bisaDipilih ? (
                              <Text fontSize="xs" color="gray.500">
                                Jam lengkap
                              </Text>
                            ) : (
                              <Checkbox
                                isChecked={isSelected}
                                pointerEvents="none"
                              />
                            )}
                          </Td>
                        ) : null}
                        <Td whiteSpace="nowrap">
                          {pegawai?.namaPegawai || pegawai?.nama || "-"}
                        </Td>
                        <Td whiteSpace="nowrap">{pegawai?.jabatan || "-"}</Td>
                        <Td>{fields.unitKerja}</Td>
                        <Td whiteSpace="nowrap">{fields.jamMasuk}</Td>
                        <Td whiteSpace="nowrap">{fields.jamPulang}</Td>
                        <Td whiteSpace="nowrap">
                          {presensi?.jamKerja != null
                            ? `${presensi.jamKerja / 60} jam`
                            : "-"}
                        </Td>
                        <Td>{fields.status}</Td>
                        <Td whiteSpace="nowrap">{fields.lembur}</Td>
                        <Td>{renderAksiPegawai(pegawai, ctx)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </Container>
      </Box>

      <Modal
        isOpen={isModalPresensiOpen}
        onClose={onCloseModalPresensi}
        isCentered={!isMobile}
        size={{ base: "full", md: "md" }}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          m={{ base: 0, md: "auto" }}
          borderRadius={{ base: 0, md: "md" }}
          maxH={{ base: "100dvh", md: "auto" }}
        >
          <ModalHeader fontSize={{ base: "md", md: "lg" }}>
            Buat Presensi
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Tanggal: <b>{formattedTanggal}</b>
              </Text>
              <Text fontSize="sm">
                Pegawai terpilih ({getSelectedPegawaiList().length}):
              </Text>
              <Box
                maxH="120px"
                overflowY="auto"
                borderWidth="1px"
                borderRadius="md"
                p={2}
              >
                {getSelectedPegawaiList().map((pegawai) => (
                  <Text key={pegawai?.id} fontSize="sm">
                    - {pegawai?.namaPegawai || pegawai?.nama || "-"} (
                    {pegawai?.nip || "-"})
                  </Text>
                ))}
              </Box>

              <FormControl isRequired>
                <FormLabel>Unit Kerja</FormLabel>
                <Select
                  placeholder={
                    loadingUnitKerja
                      ? "Memuat unit kerja..."
                      : "Pilih unit kerja"
                  }
                  value={modalUnitKerjaId}
                  onChange={(e) => setModalUnitKerjaId(e.target.value)}
                  isDisabled={loadingUnitKerja}
                >
                  {unitKerjaList.map((uk) => (
                    <option key={uk.id} value={uk.id}>
                      {uk.unitKerja || uk.kode || `Unit ${uk.id}`}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipe Jam</FormLabel>
                <Select
                  value={modalTipeJam}
                  onChange={(e) => setModalTipeJam(e.target.value)}
                >
                  <option value="jamMasuk">Jam Masuk</option>
                  <option value="jamPulang">Jam Pulang</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Jam</FormLabel>
                <Input
                  type="time"
                  step={1}
                  value={modalJam}
                  onChange={(e) => setModalJam(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter
            flexDirection={{ base: "column-reverse", sm: "row" }}
            gap={{ base: 2, sm: 0 }}
          >
            <Button
              variant="outline"
              mr={{ base: 0, sm: 3 }}
              onClick={onCloseModalPresensi}
              isDisabled={isSubmittingBulk}
              w={{ base: "100%", sm: "auto" }}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleKonfirmasiSimpanPresensi}
              isLoading={isSubmittingBulk}
              w={{ base: "100%", sm: "auto" }}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default DetailPresensi;
