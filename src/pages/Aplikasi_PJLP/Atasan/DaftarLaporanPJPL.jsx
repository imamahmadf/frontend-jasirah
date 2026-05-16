import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Spinner,
  Center,
  Text,
  useToast,
  HStack,
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
} from "@chakra-ui/react";
import axios from "axios";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

function DaftarLaporanPJPL() {
  const user = useSelector(userRedux);
  const pegawaiId = user?.[0]?.pegawaiId;

  const [dataLaporan, setDataLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null); // simpan id yang sedang diupdate
  const [selectedId, setSelectedId] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchLaporan = async () => {
    if (!pegawaiId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/laporan-kinerja-pjpl/${pegawaiId}`
      );
      setDataLaporan(res.data.result || []);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal mengambil data laporan kinerja PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pegawaiId]);

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
      fetchLaporan();
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

  const handleLinkClick = (link) => {
    if (!link) return;
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={6}>Laporan Kinerja PJPL</Heading>

          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : dataLaporan && dataLaporan.length > 0 ? (
            <Table variant={"pegawai"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Indikator</Th>
                  <Th>Target</Th>
                  <Th>Capaian</Th>
                  <Th>Status</Th>
                  <Th>Periode Kontrak</Th>
                  <Th>Bukti Dukung</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody bgColor={"secondary"}>
                {dataLaporan.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>{index + 1}</Td>
                    <Td>{item.kinerjaPJPL?.indikator || "-"}</Td>
                    <Td>{item.kinerjaPJPL?.target || "-"}</Td>
                    <Td>{item.hasil ?? item.nilai ?? "-"}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item.status === "diajukan"
                            ? "blue"
                            : item.status === "disetujui"
                            ? "green"
                            : item.status === "ditolak"
                            ? "red"
                            : "gray"
                        }
                      >
                        {item.status || "-"}
                      </Badge>
                    </Td>
                    <Td>
                      {item.kinerjaPJPL?.kontrakPJPL?.tanggalAwal &&
                      item.kinerjaPJPL?.kontrakPJPL?.tanggalAkhir
                        ? `${new Date(
                            item.kinerjaPJPL.kontrakPJPL.tanggalAwal
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} - ${new Date(
                            item.kinerjaPJPL.kontrakPJPL.tanggalAkhir
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "-"}
                    </Td>
                    <Td>
                      {item.buktiDukung ? (
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => handleLinkClick(item.buktiDukung)}
                        >
                          Lihat
                        </Button>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td>
                      {item.status === "disetujui" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          isLoading={isUpdating === item.id}
                          onClick={() => updateStatus(item.id, "ditolak")}
                        >
                          Batal
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="green"
                          isLoading={isUpdating === item.id}
                          onClick={() => handleOpenModal(item.id)}
                        >
                          Terima
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Center py={"50px"}>
              <Text>Tidak ada data laporan kinerja PJPL</Text>
            </Center>
          )}
        </Container>
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
      </Box>
    </LayoutPegawai>
  );
}

export default DaftarLaporanPJPL;
