import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Heading,
  useToast,
  Badge,
  VStack,
  Divider,
  Center,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Spacer,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";

function PenilaianAtasan(props) {
  const [dataRealisasi, setDataRealisasi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capaian, setCapaian] = useState("");
  const [buktiDukung, setBuktiDukung] = useState("");
  const [selectedKinerjaPJPLId, setSelectedKinerjaPJPLId] = useState(null);
  const [realisasiKinerjaPJPLId, setRealisasiKinerjaPJPLId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");
  const history = useHistory();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(null); // simpan id yang sedang diupdate
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenKualitatif,
    onOpen: onOpenKualitatif,
    onClose: onCloseKualitatif,
  } = useDisclosure();
  const [selectedKualitatifId, setSelectedKualitatifId] = useState(null);
  const [nilaiKualitatif, setNilaiKualitatif] = useState("");
  const [catatanKualitatif, setCatatanKualitatif] = useState("");
  const [isUpdatingKualitatif, setIsUpdatingKualitatif] = useState(false);
  async function fetchDataRealisasi() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/realisasi-pjpl/${props.match.params.id}`,
      );
      setDataRealisasi(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error || "Gagal mengambil data realisasi PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }
  // Hitung total bulan dari periode kontrak (inclusive)
  const getTotalBulan = (tanggalAwal, tanggalAkhir) => {
    if (!tanggalAwal || !tanggalAkhir) return 1;
    const start = new Date(tanggalAwal);
    const end = new Date(tanggalAkhir);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1;
    return Math.max(1, months);
  };

  // Nilai otomatis: target_per_bulan = target ÷ totalBulan (misal 4÷3 = 1,3).
  // Jika capaian = target_per_bulan maka nilai = 10. Rumus: (capaian ÷ target_per_bulan) × 10, max 10.
  const hitungNilaiOtomatis = (item) => {
    const target = Number(item?.target) || 0;
    const hasil = Number(item?.realisasiKinerjaPJPLs?.hasil) || 0;
    const totalBulan = getTotalBulan(
      item?.kontrakPJPL?.tanggalAwal,
      item?.kontrakPJPL?.tanggalAkhir,
    );
    if (target <= 0 || totalBulan <= 0) return 0;
    const targetPerBulan = Math.round((target / totalBulan) * 10) / 10; // 4/3 = 1,3
    const nilai = (hasil / targetPerBulan) * 10; // capaian 1,3 → 10; capaian 1 → 7,7
    const nilaiCapped = Math.max(0, Math.min(10, nilai));
    return Math.round(nilaiCapped * 10) / 10; // 1 desimal
  };

  // Rata-rata nilai Hasil Kerja Kualitatif PJPL
  const rata2Kualitatif = useMemo(() => {
    const arr = dataRealisasi?.hasilKerjaKualitatifPJPLs || [];
    const values = arr
      .map((item) => parseFloat(item.nilai))
      .filter((n) => !Number.isNaN(n));
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }, [dataRealisasi?.hasilKerjaKualitatifPJPLs]);

  // Rata-rata nilai Daftar Kinerja PJPL
  const rata2Kinerja = useMemo(() => {
    const arr = dataRealisasi?.kinerjaPJPLs || [];
    const values = arr
      .map((item) => parseFloat(item.realisasiKinerjaPJPLs?.nilai))
      .filter((n) => !Number.isNaN(n));
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }, [dataRealisasi?.kinerjaPJPLs]);

  // Nilai akhir tertimbang: Daftar Kinerja 40% + Hasil Kerja Kualitatif 60%
  const nilaiAkhirTertimbang = useMemo(() => {
    if (rata2Kinerja == null && rata2Kualitatif == null) return null;
    const kinerja = rata2Kinerja ?? 0;
    const kualitatif = rata2Kualitatif ?? 0;
    return Math.round((kinerja * 0.4 + kualitatif * 0.6) * 10) / 10;
  }, [rata2Kinerja, rata2Kualitatif]);

  const handleOpenModal = (item) => {
    const id = item?.realisasiKinerjaPJPLs?.id;
    setSelectedId(id);
    const nilaiAuto = hitungNilaiOtomatis(item);
    setNilaiInput(String(nilaiAuto));
    onOpen();
  };

  const handleSubmitNilai = () => {
    const parsedNilai = parseFloat(nilaiInput);

    if (Number.isNaN(parsedNilai)) {
      toast({
        title: "Error!",
        description: "Nilai harus diisi.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (parsedNilai < 0 || parsedNilai > 10) {
      toast({
        title: "Error!",
        description: "Nilai harus antara 0 sampai 10.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    updateStatus(selectedId, "diterima", parsedNilai);
    onClose();
  };
  const handleResetFormRealisasi = () => {
    setCapaian("");
    setBuktiDukung("");
    setSelectedKinerjaPJPLId(null);
    setRealisasiKinerjaPJPLId(null);
  };
  const updateStatus = async (id, statusBaru, nilai) => {
    setIsUpdating(id);
    try {
      const payload = { status: statusBaru };
      if (statusBaru === "diterima" && nilai !== undefined) {
        payload.nilai = nilai;
      }

      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/update/hasil-kerja-pjpl/${id}`,
        payload,
      );
      toast({
        title: "Berhasil",
        description: `Status diubah menjadi ${statusBaru}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      fetchDataRealisasi();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal mengubah status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(null);
    }
  };
  const tambahRealisasi = async () => {
    // Validasi form
    if (!capaian || capaian <= 0) {
      toast({
        title: "Error!",
        description: "Masukkan capaian yang valid (harus lebih dari 0)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!buktiDukung.trim()) {
      toast({
        title: "Error!",
        description: "Masukkan link bukti dukung",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validasi URL format (opsional, bisa dihapus jika tidak diperlukan)
    try {
      new URL(buktiDukung);
    } catch (e) {
      toast({
        title: "Error!",
        description: "Format link bukti dukung tidak valid",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        realisasiPJPLId: props.match.params.id,
        kinerjaPJPLId: selectedKinerjaPJPLId,
        capaian: parseFloat(capaian),
        buktiDukung: buktiDukung.trim(),
      };

      // Hanya tambahkan realisasiKinerjaPJPLId jika ada nilainya
      if (realisasiKinerjaPJPLId) {
        payload.realisasiKinerjaPJPLId = realisasiKinerjaPJPLId;
      }

      console.log("Payload yang dikirim:", payload);

      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/post/hasil-kerja-pjpl`,
        payload,
      );

      toast({
        title: "Berhasil!",
        description: "Data realisasi berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleResetFormRealisasi();
      onRealisasiClose();
      fetchDataRealisasi();
    } catch (err) {
      console.error(err.message);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Data gagal ditambahkan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk mendapatkan realisasiKinerjaPJPLs berdasarkan kinerjaPJPLId
  const getRealisasiKinerjaPJPLs = (kinerjaPJPLId) => {
    const kinerja = dataRealisasi?.kinerjaPJPLs?.find(
      (k) => k.id === kinerjaPJPLId,
    );
    return kinerja?.realisasiKinerjaPJPLs || null;
  };

  // Fungsi untuk mendapatkan realisasiKinerjaPJPLId berdasarkan kinerjaPJPLId
  const getRealisasiKinerjaPJPLId = (kinerjaPJPLId) => {
    // Cari kinerja berdasarkan ID
    const kinerja = dataRealisasi?.kinerjaPJPLs?.find(
      (k) => k.id === kinerjaPJPLId,
    );

    // ID relasi ada di realisasiKinerjaPJPLs.id
    if (kinerja?.realisasiKinerjaPJPLs?.id) {
      return kinerja.realisasiKinerjaPJPLs.id;
    }

    return null;
  };

  // Fungsi untuk membuka link di tab baru
  const handleLinkClick = (link) => {
    if (!link) return;
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

  const handleOpenModalKualitatif = (item) => {
    setSelectedKualitatifId(item.id);
    setNilaiKualitatif(item.nilai != null ? String(item.nilai) : "");
    setCatatanKualitatif(item.catatan ?? "");
    onOpenKualitatif();
  };

  const handleCloseModalKualitatif = () => {
    setSelectedKualitatifId(null);
    setNilaiKualitatif("");
    setCatatanKualitatif("");
    onCloseKualitatif();
  };

  const handleSubmitPenilaianKualitatif = async () => {
    const nilaiNum = parseFloat(nilaiKualitatif);
    if (Number.isNaN(nilaiNum) || nilaiNum < 1 || nilaiNum > 10) {
      toast({
        title: "Error!",
        description: "Nilai harus angka antara 1 sampai 10.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsUpdatingKualitatif(true);
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/update/hasil-kerja-kualitatif-pjpl/${selectedKualitatifId}`,
        { nilai: nilaiNum, catatan: catatanKualitatif.trim() || null },
      );
      toast({
        title: "Berhasil",
        description: "Penilaian kualitatif berhasil disimpan.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      handleCloseModalKualitatif();
      fetchDataRealisasi();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal menyimpan penilaian",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingKualitatif(false);
    }
  };

  useEffect(() => {
    fetchDataRealisasi();
  }, []);

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <HStack mb={"30px"}>
            <Button onClick={() => history.goBack()} variant={"outline"}>
              Kembali
            </Button>
          </HStack>

          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : dataRealisasi ? (
            <VStack spacing={6} align="stretch">
              {/* Informasi Realisasi PJPL */}
              <Card>
                <CardHeader>
                  <Heading size="md">Informasi Realisasi PJPL</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Nama Pegawai
                      </Text>
                      <Text>
                        {dataRealisasi.kontrakPJPL?.pegawai?.nama ||
                          dataRealisasi.kinerjaPJPLs?.[0]?.kontrakPJPL?.pegawai
                            ?.nama ||
                          "-"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {dataRealisasi.kontrakPJPL?.pegawai?.jabatan ||
                          dataRealisasi.kinerjaPJPLs?.[0]?.kontrakPJPL?.pegawai
                            ?.jabatan ||
                          ""}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Pejabat Verifikator
                      </Text>
                      <Text>
                        {dataRealisasi.kinerjaPJPLs?.[0]?.indikatorPejabat
                          ?.pejabatVerifikator?.pegawai?.nama || "-"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {dataRealisasi.kinerjaPJPLs?.[0]?.indikatorPejabat
                          ?.pejabatVerifikator?.pegawai?.jabatan || ""}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Periode Kontrak
                      </Text>
                      <Text>
                        {(() => {
                          const kontrak =
                            dataRealisasi.kontrakPJPL ||
                            dataRealisasi.kinerjaPJPLs?.[0]?.kontrakPJPL;
                          const awal = kontrak?.tanggalAwal;
                          const akhir = kontrak?.tanggalAkhir;
                          if (!awal || !akhir) return "-";
                          return `${new Date(awal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} - ${new Date(akhir).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`;
                        })()}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        ID Realisasi
                      </Text>
                      <Text>{dataRealisasi.id ?? "-"}</Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Periode
                      </Text>
                      <Text>
                        {dataRealisasi.tanggalAwal && dataRealisasi.tanggalAkhir
                          ? `${new Date(
                              dataRealisasi.tanggalAwal,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} - ${new Date(
                              dataRealisasi.tanggalAkhir,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "-"}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Status
                      </Text>
                      <Badge
                        colorScheme={
                          dataRealisasi.status === "diajukan"
                            ? "blue"
                            : dataRealisasi.status === "disetujui"
                              ? "green"
                              : dataRealisasi.status === "ditolak"
                                ? "red"
                                : "gray"
                        }
                      >
                        {dataRealisasi.status || "-"}
                      </Badge>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Jumlah Hasil Kerja
                      </Text>
                      <Text>
                        {Array.isArray(dataRealisasi.hasilKerjaPJPLs)
                          ? dataRealisasi.hasilKerjaPJPLs.length
                          : 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Dibuat
                      </Text>
                      <Text>
                        {dataRealisasi.createdAt
                          ? new Date(dataRealisasi.createdAt).toLocaleString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontWeight="bold"
                        mb={2}
                        fontSize="sm"
                        color="gray.600"
                      >
                        Diperbarui
                      </Text>
                      <Text>
                        {dataRealisasi.updatedAt
                          ? new Date(dataRealisasi.updatedAt).toLocaleString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Hasil Kerja Kualitatif PJPL */}
              {dataRealisasi.hasilKerjaKualitatifPJPLs &&
                dataRealisasi.hasilKerjaKualitatifPJPLs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Hasil Kerja Kualitatif PJPL</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant={"pegawai"} size="sm">
                        <Thead>
                          <Tr>
                            <Th>No</Th>
                            <Th>Indikator</Th>
                            <Th>Nilai</Th>
                            <Th>Catatan</Th>
                            <Th>Periode</Th>
                            <Th>Aksi</Th>
                          </Tr>
                        </Thead>
                        <Tbody bgColor={"secondary"}>
                          {dataRealisasi.hasilKerjaKualitatifPJPLs.map(
                            (item, index) => (
                              <Tr key={item.id}>
                                <Td>{index + 1}</Td>
                                <Td>{item.kualitatifPJPL?.indikator || "-"}</Td>
                                <Td>{item.nilai ?? "-"}</Td>
                                <Td>{item.catatan ?? "-"}</Td>
                                <Td>
                                  {item.tanggalAwal && item.tanggalAkhir
                                    ? `${new Date(
                                        item.tanggalAwal,
                                      ).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })} - ${new Date(
                                        item.tanggalAkhir,
                                      ).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}`
                                    : "-"}
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleOpenModalKualitatif(item)
                                    }
                                  >
                                    Penilaian
                                  </Button>
                                </Td>
                              </Tr>
                            ),
                          )}
                        </Tbody>
                        <Tfoot>
                          <Tr fontWeight="semibold" bgColor="gray.50">
                            <Td colSpan={2}>Rata-rata</Td>
                            <Td>
                              {rata2Kualitatif != null
                                ? rata2Kualitatif.toFixed(1)
                                : "-"}
                            </Td>
                            <Td colSpan={3}></Td>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </CardBody>
                  </Card>
                )}

              {/* Hasil Kerja PJPL (jika ada) */}
              {Array.isArray(dataRealisasi.hasilKerjaPJPLs) &&
                dataRealisasi.hasilKerjaPJPLs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Hasil Kerja PJPL</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant={"pegawai"} size="sm">
                        <Thead>
                          <Tr>
                            <Th>No</Th>
                            <Th>ID</Th>
                            <Th>Kinerja PJPL ID</Th>
                            <Th>Realisasi PJPL ID</Th>
                            <Th>Capaian / Hasil</Th>
                            <Th>Nilai</Th>
                            <Th>Status</Th>
                            <Th>Bukti Dukung</Th>
                            <Th>Dibuat</Th>
                            <Th>Diperbarui</Th>
                          </Tr>
                        </Thead>
                        <Tbody bgColor={"secondary"}>
                          {dataRealisasi.hasilKerjaPJPLs.map((hj, idx) => (
                            <Tr key={hj.id}>
                              <Td>{idx + 1}</Td>
                              <Td>{hj.id}</Td>
                              <Td>{hj.kinerjaPJPLId ?? "-"}</Td>
                              <Td>{hj.realisasiPJPLId ?? "-"}</Td>
                              <Td>{hj.hasil ?? hj.capaian ?? "-"}</Td>
                              <Td>{hj.nilai ?? "-"}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    hj.status === "diajukan"
                                      ? "blue"
                                      : hj.status === "diterima"
                                        ? "green"
                                        : hj.status === "ditolak"
                                          ? "red"
                                          : "gray"
                                  }
                                >
                                  {hj.status || "-"}
                                </Badge>
                              </Td>
                              <Td>
                                {hj.buktiDukung ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleLinkClick(hj.buktiDukung)
                                    }
                                  >
                                    Lihat
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </Td>
                              <Td>
                                {hj.createdAt
                                  ? new Date(hj.createdAt).toLocaleString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "-"}
                              </Td>
                              <Td>
                                {hj.updatedAt
                                  ? new Date(hj.updatedAt).toLocaleString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "-"}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                )}

              {/* Daftar Kinerja PJPL */}
              {dataRealisasi.kinerjaPJPLs &&
                dataRealisasi.kinerjaPJPLs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Hasil Kerja Kuantitatif PJPL</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant={"pegawai"} size="sm">
                        <Thead>
                          <Tr>
                            <Th>No</Th>
                            <Th>Indikator Pejabat</Th>
                            <Th>Rencana Hasil Kerja (Indikator)</Th>
                            <Th>Target</Th>
                            <Th>Satuan</Th>
                            <Th>Capaian (Hasil)</Th>
                            <Th>Bukti Dukung</Th>
                            <Th>Nilai</Th>
                            <Th>Status Realisasi</Th>
                            <Th>Realisasi</Th>
                          </Tr>
                        </Thead>
                        <Tbody bgColor={"secondary"}>
                          {dataRealisasi.kinerjaPJPLs.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{index + 1}</Td>
                              <Td>{item.indikatorPejabat?.indikator || "-"}</Td>
                              <Td>{item.indikator || "-"}</Td>
                              <Td>{item.target ?? "-"}</Td>
                              <Td>{item.satuan || "-"}</Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.hasil ?? "-"}
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.buktiDukung ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleLinkClick(
                                        item.realisasiKinerjaPJPLs.buktiDukung,
                                      )
                                    }
                                  >
                                    Lihat Bukti
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.nilai ?? "-"}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    item.realisasiKinerjaPJPLs?.status ===
                                    "diajukan"
                                      ? "blue"
                                      : item.realisasiKinerjaPJPLs?.status ===
                                          "diterima"
                                        ? "green"
                                        : item.realisasiKinerjaPJPLs?.status ===
                                            "ditolak"
                                          ? "red"
                                          : "gray"
                                  }
                                >
                                  {item.realisasiKinerjaPJPLs?.status || "-"}
                                </Badge>
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.status ===
                                "diterima" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="red"
                                    isLoading={
                                      isUpdating ===
                                      item.realisasiKinerjaPJPLs?.id
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        item.realisasiKinerjaPJPLs?.id,
                                        "ditolak",
                                      )
                                    }
                                  >
                                    Batal
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    isLoading={
                                      isUpdating ===
                                      item.realisasiKinerjaPJPLs?.id
                                    }
                                    onClick={() => handleOpenModal(item)}
                                  >
                                    Terima
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                        <Tfoot>
                          <Tr fontWeight="semibold" bgColor="gray.50">
                            <Td colSpan={7}>Rata-rata</Td>
                            <Td>
                              {rata2Kinerja != null
                                ? rata2Kinerja.toFixed(1)
                                : "-"}
                            </Td>
                            <Td colSpan={2}></Td>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </CardBody>
                  </Card>
                )}

              {/* Nilai Akhir Tertimbang: 40% Daftar Kinerja + 60% Hasil Kerja Kualitatif */}
              {(rata2Kinerja != null || rata2Kualitatif != null) && (
                <Card>
                  <CardHeader>
                    <Heading size="md">Nilai Akhir Penilaian PJPL</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Rata-rata Hasil Kerja Kuantitatif Kinerja PJPL (40%)
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {rata2Kinerja != null ? rata2Kinerja.toFixed(1) : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Rata-rata Hasil Kerja Kualitatif Kinerja PJPL (60%)
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {rata2Kualitatif != null
                            ? rata2Kualitatif.toFixed(1)
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Nilai Akhir (Tertimbang)
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600">
                          {nilaiAkhirTertimbang != null
                            ? nilaiAkhirTertimbang.toFixed(1)
                            : "-"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          40% × Daftar Kinerja + 60% × Hasil Kerja Kualitatif
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              )}
            </VStack>
          ) : (
            <Center py={"50px"}>
              <Text>Data tidak ditemukan</Text>
            </Center>
          )}
        </Container>
      </Box>

      {/* Modal Input Realisasi */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setNilaiInput("");
          onClose();
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Masukkan Nilai</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nilai (0 - 10, terisi otomatis)</FormLabel>
              <Input
                type="number"
                min={0}
                max={10}
                step="0.1"
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                placeholder="(Capaian ÷ target per bulan) × 10"
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                Target per bulan = Target ÷ jumlah bulan (contoh: 4 ÷ 3 = 1,3).
                Nilai = (Capaian ÷ target per bulan) × 10. Capaian 1,3 → nilai
                10; capaian 1 → nilai 7,7.
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                setNilaiInput("");
                onClose();
              }}
            >
              Batal
            </Button>
            <Button
              colorScheme="green"
              isLoading={isUpdating === selectedId}
              onClick={handleSubmitNilai}
            >
              Simpan & Terima
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Penilaian Hasil Kerja Kualitatif */}
      <Modal
        isOpen={isOpenKualitatif}
        onClose={handleCloseModalKualitatif}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Penilaian Hasil Kerja Kualitatif</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Nilai (1 - 10)</FormLabel>
              <Input
                type="number"
                min={1}
                max={10}
                step="0.1"
                value={nilaiKualitatif}
                onChange={(e) => setNilaiKualitatif(e.target.value)}
                placeholder="Masukkan nilai 1 sampai 10"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Catatan</FormLabel>
              <Textarea
                value={catatanKualitatif}
                onChange={(e) => setCatatanKualitatif(e.target.value)}
                placeholder="Catatan penilaian (opsional)"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModalKualitatif}>
              Batal
            </Button>
            <Button
              colorScheme="blue"
              isLoading={isUpdatingKualitatif}
              onClick={handleSubmitPenilaianKualitatif}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default PenilaianAtasan;
