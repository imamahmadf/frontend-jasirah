import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
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
  async function fetchDataRealisasi() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/realisasi-pjpl/${props.match.params.id}`
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
  const handleOpenModal = (id) => {
    setSelectedId(id);
    setNilaiInput("");
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
        payload
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
        payload
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
      (k) => k.id === kinerjaPJPLId
    );
    return kinerja?.realisasiKinerjaPJPLs || null;
  };

  // Fungsi untuk mendapatkan realisasiKinerjaPJPLId berdasarkan kinerjaPJPLId
  const getRealisasiKinerjaPJPLId = (kinerjaPJPLId) => {
    // Cari kinerja berdasarkan ID
    const kinerja = dataRealisasi?.kinerjaPJPLs?.find(
      (k) => k.id === kinerjaPJPLId
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
                  <SimpleGrid columns={3} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Periode
                      </Text>
                      <Text>
                        {dataRealisasi.tanggalAwal && dataRealisasi.tanggalAkhir
                          ? `${new Date(
                              dataRealisasi.tanggalAwal
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} - ${new Date(
                              dataRealisasi.tanggalAkhir
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "-"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
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
                  </SimpleGrid>{" "}
                  <Button>Terima</Button>
                </CardBody>
              </Card>

              {/* Daftar Kinerja PJPL */}
              {dataRealisasi.kinerjaPJPLs &&
                dataRealisasi.kinerjaPJPLs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Daftar Kinerja PJPL</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant={"pegawai"}>
                        <Thead>
                          <Tr>
                            <Th>No</Th>
                            <Th>Indikator</Th>
                            <Th>Rencana Hasil Kerja</Th>
                            <Th>Target</Th>
                            <Th>Status</Th>
                            <Th>Pegawai Kontrak</Th>
                            <Th>Capaian</Th>
                            <Th>Bukti Dukung</Th>
                            <Th>Nilai</Th>
                            <Th>Realisasi</Th>
                          </Tr>
                        </Thead>
                        <Tbody bgColor={"secondary"}>
                          {dataRealisasi.kinerjaPJPLs.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{item.realisasiKinerjaPJPLs?.id}</Td>
                              <Td>{item.indikatorPejabat?.indikator || "-"}</Td>
                              <Td>{item.indikator || "-"}</Td>
                              <Td>{item.target || "-"}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    item.realisasiKinerjaPJPLs?.status ===
                                    "diajukan"
                                      ? "blue"
                                      : item.status === "disetujui"
                                      ? "green"
                                      : item.status === "ditolak"
                                      ? "red"
                                      : "gray"
                                  }
                                >
                                  {item.realisasiKinerjaPJPLs?.status || "-"}
                                </Badge>
                              </Td>
                              <Td>
                                {item.kontrakPJPL?.pegawai?.nama || "-"}
                                <br />
                                <Text fontSize="sm" color="gray.500">
                                  {item.kontrakPJPL?.pegawai?.jabatan || ""}
                                </Text>
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.hasil || "-"}
                              </Td>

                              <Td>
                                {item.realisasiKinerjaPJPLs?.buktiDukung ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleLinkClick(
                                        item.realisasiKinerjaPJPLs.buktiDukung
                                      )
                                    }
                                  >
                                    Lihat Bukti Dukung
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.nilai || "-"}
                              </Td>
                              <Td>
                                {item.status === "disetujui" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="red"
                                    isLoading={isUpdating === item.id}
                                    onClick={() =>
                                      updateStatus(item.id, "ditolak")
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
                                    onClick={() =>
                                      handleOpenModal(
                                        item.realisasiKinerjaPJPLs?.id
                                      )
                                    }
                                  >
                                    Terima
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
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
              <FormLabel>Nilai (0 - 10)</FormLabel>
              <Input
                type="number"
                min={0}
                max={10}
                step="0.1"
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                placeholder="Contoh: 8.5"
              />
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
    </LayoutPegawai>
  );
}

export default PenilaianAtasan;
