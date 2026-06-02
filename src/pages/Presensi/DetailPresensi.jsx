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
  const {
    isOpen: isModalPresensiOpen,
    onOpen: onOpenModalPresensi,
    onClose: onCloseModalPresensi,
  } = useDisclosure();
  const toast = useToast();

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

  const buildFormFromResult = (result = []) => {
    const initialForm = {};
    result.forEach((pegawai) => {
      const presensi = pegawai?.presensis?.[0];
      initialForm[pegawai?.id] = {
        jamMasuk: formatJamInput(presensi?.jamMasuk),
        jamPulang: formatJamInput(presensi?.jamPulang),
      };
    });
    return initialForm;
  };

  const handleMulaiEdit = (pegawaiId) => {
    setEditingByPegawai((prev) => ({ ...prev, [pegawaiId]: true }));
  };

  const handleToggleModeBuatPresensi = () => {
    setIsModeBuatPresensi((prev) => {
      const nextMode = !prev;
      if (!nextMode) {
        setSelectedPegawaiIds({});
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

  const handleBatalEdit = (pegawai) => {
    const pegawaiId = pegawai?.id;
    if (!pegawaiId) return;
    const presensi = pegawai?.presensis?.[0];

    setFormByPegawai((prev) => ({
      ...prev,
      [pegawaiId]: {
        jamMasuk: formatJamInput(presensi?.jamMasuk),
        jamPulang: formatJamInput(presensi?.jamPulang),
      },
    }));
    setEditingByPegawai((prev) => ({ ...prev, [pegawaiId]: false }));
  };

  const handleSimpanPresensi = async (pegawai) => {
    const pegawaiId = pegawai?.id;
    if (!pegawaiId || !tanggal) return;

    const form = formByPegawai[pegawaiId] || {};
    const jamMasukDate = mergeTanggalDanJam(tanggal, form.jamMasuk);
    const jamPulangDate = mergeTanggalDanJam(tanggal, form.jamPulang);

    if (!jamMasukDate && !jamPulangDate) {
      toast({
        title: "Input belum lengkap",
        description: "Isi minimal jam masuk atau jam pulang.",
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
  console.log(dataPegawai);
  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading size="md" mb={4}>
            Detail Presensi
          </Heading>
          <Text mb={4}>
            Tanggal dipilih: <b>{formattedTanggal}</b>
          </Text>
          <HStack mb={4} spacing={3}>
            <Button
              size="sm"
              colorScheme={isModeBuatPresensi ? "red" : "teal"}
              variant={isModeBuatPresensi ? "outline" : "solid"}
              onClick={handleToggleModeBuatPresensi}
            >
              {isModeBuatPresensi ? "Batal Buat Presensi" : "Buat Presensi"}
            </Button>
            {isModeBuatPresensi ? (
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleBukaModalPresensi}
              >
                Simpan Presensi Terpilih
              </Button>
            ) : null}
          </HStack>

          {loading ? (
            <Center py={8}>
              <Spinner />
            </Center>
          ) : errorMessage ? (
            <Text color="red.500">{errorMessage}</Text>
          ) : (
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>No</Th>
                  {isModeBuatPresensi ? <Th>Pilih</Th> : null}
                  <Th>Nama Pegawai</Th>
                  <Th>NIP</Th>
                  <Th>Jam Masuk</Th>
                  <Th>Jam Pulang</Th> <Th>Jam Kerja</Th>
                  <Th>Status Presensi</Th>
                  <Th>Keterangan</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataPegawai.length === 0 ? (
                  <Tr>
                    <Td colSpan={isModeBuatPresensi ? 9 : 8} textAlign="center">
                      Data presensi tidak ditemukan.
                    </Td>
                  </Tr>
                ) : (
                  dataPegawai.map((pegawai, index) => {
                    const presensi = pegawai?.presensis?.[0] || null;
                    const isEditing = Boolean(editingByPegawai[pegawai?.id]);
                    const isSelected = Boolean(selectedPegawaiIds[pegawai?.id]);
                    const bisaDipilih = bisaDipilihBuatPresensi(pegawai);
                    const isInputEnabled = isEditing && !isModeBuatPresensi;
                    const statusObj = presensi?.statusPresensi || {};
                    const statusLabel =
                      statusObj?.namaStatus ||
                      statusObj?.status ||
                      statusObj?.nama ||
                      (presensi ? "Tercatat" : "Belum Presensi");

                    return (
                      <Tr key={pegawai?.id || `pegawai-${index}`}>
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
                                onChange={(e) =>
                                  handleTogglePilihPegawai(
                                    pegawai,
                                    e.target.checked,
                                  )
                                }
                              />
                            )}
                          </Td>
                        ) : null}
                        <Td>{pegawai?.namaPegawai || pegawai?.nama || "-"}</Td>
                        <Td>{pegawai?.nip || "-"}</Td>
                        <Td>
                          {isInputEnabled ? (
                            <Input
                              size="sm"
                              type="time"
                              step={1}
                              value={formByPegawai[pegawai?.id]?.jamMasuk || ""}
                              onChange={(e) =>
                                handleChangeJam(
                                  pegawai?.id,
                                  "jamMasuk",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            formatJam(presensi?.jamMasuk)
                          )}
                        </Td>
                        <Td>
                          {isInputEnabled ? (
                            <Input
                              size="sm"
                              type="time"
                              step={1}
                              value={
                                formByPegawai[pegawai?.id]?.jamPulang || ""
                              }
                              onChange={(e) =>
                                handleChangeJam(
                                  pegawai?.id,
                                  "jamPulang",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            formatJam(presensi?.jamPulang)
                          )}
                        </Td>{" "}
                        <Td>{presensi?.jamKerja / 60} jam </Td>
                        <Td>
                          <Badge
                            colorScheme={presensi ? "green" : "orange"}
                            borderRadius="md"
                            px={2}
                          >
                            {statusLabel}
                          </Badge>
                        </Td>
                        <Td>{presensi?.keterangan || "-"}</Td>
                        <Td>
                          <HStack spacing={2}>
                            {isModeBuatPresensi ? (
                              <Text fontSize="xs" color="gray.500">
                                {!bisaDipilih
                                  ? "Jam masuk & pulang sudah ada"
                                  : isSelected
                                    ? "Siap disimpan"
                                    : "Belum dipilih"}
                              </Text>
                            ) : isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  isLoading={Boolean(
                                    savingByPegawai[pegawai?.id],
                                  )}
                                  onClick={() => handleSimpanPresensi(pegawai)}
                                >
                                  Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBatalEdit(pegawai)}
                                  isDisabled={Boolean(
                                    savingByPegawai[pegawai?.id],
                                  )}
                                >
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                colorScheme="yellow"
                                variant="outline"
                                onClick={() => handleMulaiEdit(pegawai?.id)}
                              >
                                Edit
                              </Button>
                            )}
                            <Text fontSize="xs" color="gray.500">
                              {formatJam(presensi?.jamMasuk)} -{" "}
                              {formatJam(presensi?.jamPulang)}
                            </Text>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          )}
        </Container>
      </Box>

      <Modal
        isOpen={isModalPresensiOpen}
        onClose={onCloseModalPresensi}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Buat Presensi</ModalHeader>
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

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onCloseModalPresensi}
              isDisabled={isSubmittingBulk}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleKonfirmasiSimpanPresensi}
              isLoading={isSubmittingBulk}
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
