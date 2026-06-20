import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Thead,
  Table,
  Tr,
  Th,
  Td,
  Tbody,
  Heading,
  HStack,
  Badge,
  Text,
  Spinner,
  Center,
  useToast,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import LayoutKPBPN from "../../Componets/KPBPN/LayoutKPBPN";

const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const getTodayInputDate = () => new Date().toISOString().split("T")[0];

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatVolumeLabel = (volume, satuan) => {
  if (volume === null || volume === undefined || volume === "") return "-";
  return satuan ? `${volume} ${satuan}` : String(volume);
};

const PengisianTanki = () => {
  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dataPengisian, setDataPengisian] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCetak, setLoadingCetak] = useState({});
  const [loadingCetakBA, setLoadingCetakBA] = useState({});
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [baTanggal, setBaTanggal] = useState(getTodayInputDate());
  const [baUkuranCairan, setBaUkuranCairan] = useState("");
  const [baUkuranAir, setBaUkuranAir] = useState("");
  const [isSubmittingBA, setIsSubmittingBA] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const limit = 50;

  const fetchDataPengisianTanki = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/tanki/get?page=${page}&limit=${limit}`,
      );
      setDataPengisian(res.data.result || []);
      setTotalRows(res.data.totalRows || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelectMode = () => {
    if (isSelectMode) {
      resetSelectMode();
    } else {
      setIsSelectMode(true);
      setSelectedIds([]);
    }
  };

  const toggleSelectItem = (item) => {
    if (item.BAPenerimaanId) return;

    setSelectedIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  };

  const handleOpenModalBA = () => {
    if (!selectedIds.length) {
      toast({
        title: "Pilih data",
        description: "Pilih minimal satu pengisian tanki terlebih dahulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setBaTanggal(getTodayInputDate());
    setBaUkuranCairan("");
    setBaUkuranAir("");
    onOpen();
  };

  const handleSubmitBAPenerimaan = async () => {
    if (!baTanggal) {
      toast({
        title: "Tanggal wajib diisi",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingBA(true);
    try {
      const res = await axios.post(
        `${API_BASE}/tanki/post/ba-penerimaan`,
        {
          tanggal: baTanggal,
          ukuranCairan: baUkuranCairan !== "" ? Number(baUkuranCairan) : null,
          ukuranAir: baUkuranAir !== "" ? Number(baUkuranAir) : null,
          ids: selectedIds,
        },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BA_Penerimaan_${baTanggal}_${Date.now()}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "BA Penerimaan berhasil dibuat dan diunduh",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onClose();
      resetSelectMode();
      fetchDataPengisianTanki();
    } catch (err) {
      console.error(err);
      let message = "Gagal membuat BA Penerimaan";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          // gunakan pesan default
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      toast({
        title: "Gagal",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingBA(false);
    }
  };

  const cetakUlangBAPenerimaan = async (item) => {
    const baId = item.BAPenerimaanId;
    if (!baId) return;

    setLoadingCetakBA((prev) => ({ ...prev, [baId]: true }));

    try {
      const res = await axios.post(
        `${API_BASE}/tanki/cetak/ba-penerimaan`,
        { BAPenerimaanId: baId },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BA_Penerimaan_${baId}_${Date.now()}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Dokumen BA Penerimaan berhasil diunduh",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      let message = "Gagal mencetak ulang BA Penerimaan";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          // gunakan pesan default
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      toast({
        title: "Gagal",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingCetakBA((prev) => ({ ...prev, [baId]: false }));
    }
  };

  const cetakBAST = async (item) => {
    setLoadingCetak((prev) => ({ ...prev, [item.id]: true }));

    try {
      const res = await axios.post(
        `${API_BASE}/tanki/cetak/bast`,
        { id: item.id },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BAST_${item.tanki?.kode || item.id}_${Date.now()}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Dokumen BAST berhasil diunduh",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchDataPengisianTanki();
    } catch (err) {
      console.error(err);
      let message = "Gagal mencetak dokumen BAST";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          // gunakan pesan default
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      toast({
        title: "Gagal",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingCetak((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  useEffect(() => {
    fetchDataPengisianTanki();
  }, [page]);

  const colSpan = isSelectMode ? 19 : 18;

  return (
    <LayoutKPBPN>
      <Box bgColor="secondary" pb="40px" px="30px" minH="90vh">
        <Container variant="primary" p="30px" my="30px" minW="2000px">
          <HStack justify="space-between" mb={6}>
            <Heading color="kpbpn">Unloading truck - tanki </Heading>
            <HStack spacing={3}>
              <Text fontSize="sm" color="gray.500">
                Total: {totalRows} data
              </Text>
              {isSelectMode && (
                <>
                  <Text fontSize="sm" color="kpbpn">
                    Terpilih: {selectedIds.length}
                  </Text>
                  <Button variant="outline" onClick={resetSelectMode}>
                    Batal
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={handleOpenModalBA}
                    isDisabled={!selectedIds.length}
                  >
                    Simpan BA Penerimaan
                  </Button>
                </>
              )}
              <Button
                variant={isSelectMode ? "solid" : "outline"}
                colorScheme="orange"
                onClick={toggleSelectMode}
              >
                {isSelectMode ? "Mode Pilih Aktif" : "Buat BA Penerimaan"}
              </Button>
              <Button
                variant="primary"
                onClick={() => history.push("/tanki-kpbpn/tambah-pengisian")}
              >
                + Tambah Unloading
              </Button>
            </HStack>
          </HStack>

          {isLoading ? (
            <Center py={10}>
              <Spinner size="lg" color="kpbpn" />
            </Center>
          ) : (
            <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    {isSelectMode && <Th w="40px" />}
                    <Th>No</Th>
                    <Th>Tanggal</Th>
                    <Th>Tangki</Th>
                    <Th>Flow Meter</Th>
                    <Th>Gross</Th>
                    <Th>Net</Th>
                    <Th>Penampilan Visual</Th>
                    <Th>Warna</Th>
                    <Th>Kandungan Air</Th>
                    <Th>BSW</Th>
                    <Th>Ukuran Cairan</Th>
                    <Th>Ukuran Air</Th>
                    <Th>Catatan</Th>
                    <Th>Saksi</Th>
                    <Th>Konfirmasi Penerimaan</Th>
                    <Th>Nomor Surat BAST</Th>
                    <Th>BA Penerimaan</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataPengisian.length === 0 ? (
                    <Tr>
                      <Td colSpan={colSpan} textAlign="center" py={6}>
                        Belum ada data pengisian tanki
                      </Td>
                    </Tr>
                  ) : (
                    dataPengisian.map((item, index) => {
                      const sudahAdaBA = Boolean(item.BAPenerimaanId);
                      const isSelected = selectedIds.includes(item.id);

                      return (
                        <Tr
                          key={item.id}
                          bg={
                            isSelectMode && isSelected
                              ? "orange.50"
                              : sudahAdaBA
                                ? "gray.50"
                                : undefined
                          }
                        >
                          {isSelectMode && (
                            <Td>
                              <Checkbox
                                isChecked={isSelected}
                                isDisabled={sudahAdaBA}
                                onChange={() => toggleSelectItem(item)}
                              />
                            </Td>
                          )}
                          <Td>{page * limit + index + 1}</Td>
                          <Td>{formatDate(item.tanggal || item.createdAt)}</Td>
                          <Td>{item.tanki?.kode || "-"}</Td>
                          <Td>{item.flowMeter ?? "-"}</Td>
                          <Td>
                            {formatVolumeLabel(
                              item.gross,
                              item.satuanVolume?.satuan,
                            )}
                          </Td>
                          <Td>
                            {formatVolumeLabel(
                              item.net,
                              item.satuanVolume?.satuan,
                            )}
                          </Td>
                          <Td>{item.penampilanVisual || "-"}</Td>
                          <Td>{item.warna || "-"}</Td>
                          <Td>{item.kandunganAir ?? "-"}</Td>
                          <Td>{item.BSW ?? "-"}</Td>
                          <Td>{item.BAPenerimaan?.ukuranCairan ?? "-"}</Td>
                          <Td>{item.BAPenerimaan?.ukuranAir ?? "-"}</Td>
                          <Td>{item.catatan || "-"}</Td>
                          <Td>{item.saksi || "-"}</Td>
                          <Td>
                            {(item.konfirmasiPenerimaans || []).length === 0 ? (
                              "-"
                            ) : (
                              <Box>
                                {item.konfirmasiPenerimaans.map((kp) => (
                                  <Badge
                                    key={kp.id}
                                    colorScheme="orange"
                                    mr={1}
                                    mb={1}
                                  >
                                    {kp.nomor ||
                                      kp.suratJalan?.mitra?.nama ||
                                      `ID ${kp.id}`}
                                  </Badge>
                                ))}
                              </Box>
                            )}
                          </Td>
                          <Td>
                            {item.nomorSurat ? (
                              <Text fontSize="xs" whiteSpace="nowrap">
                                {item.nomorSurat}
                              </Text>
                            ) : (
                              <Badge colorScheme="gray">Belum ada</Badge>
                            )}
                          </Td>
                          <Td>
                            {sudahAdaBA ? (
                              <Badge colorScheme="green">
                                BA #{item.BAPenerimaanId}
                              </Badge>
                            ) : (
                              <Badge colorScheme="gray">Belum</Badge>
                            )}
                          </Td>
                          <Td>
                            <VStack align="stretch" spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="teal"
                                isLoading={loadingCetak[item.id]}
                                onClick={() => cetakBAST(item)}
                              >
                                Cetak BAST
                              </Button>
                              {sudahAdaBA && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="orange"
                                  isLoading={loadingCetakBA[item.BAPenerimaanId]}
                                  onClick={() => cetakUlangBAPenerimaan(item)}
                                >
                                  Cetak Ulang BA
                                </Button>
                              )}
                            </VStack>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Buat BA Penerimaan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                {selectedIds.length} pengisian tanki dipilih
              </Text>
              <FormControl isRequired>
                <FormLabel>Tanggal BA Penerimaan</FormLabel>
                <Input
                  type="date"
                  value={baTanggal}
                  onChange={(e) => setBaTanggal(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ukuran Cairan</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={baUkuranCairan}
                  onChange={(e) => setBaUkuranCairan(e.target.value)}
                  placeholder="Masukkan ukuran cairan"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ukuran Air</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={baUkuranAir}
                  onChange={(e) => setBaUkuranAir(e.target.value)}
                  placeholder="Masukkan ukuran air"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleSubmitBAPenerimaan}
              isLoading={isSubmittingBA}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutKPBPN>
  );
};

export default PengisianTanki;
