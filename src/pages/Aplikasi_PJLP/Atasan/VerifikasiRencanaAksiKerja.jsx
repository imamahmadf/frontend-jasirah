import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  Container,
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
  Center,
  Spinner,
  Flex,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { BsCaretRightFill, BsCaretLeftFill } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import "../../../Style/pagination.css";
import axios from "axios";
import LayoutPegawai from "../../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux } from "../../../Redux/Reducers/auth";

function VerifikasiRencanaAksiKerja() {
  const [dataKinerjaPJPL, setDataKinerjaPJPL] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [modalItem, setModalItem] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const user = useSelector(userRedux);
  const toast = useToast();

  const isModalOpen = Boolean(modalItem && modalStatus);
  const openModal = (item, status) => {
    setModalItem(item);
    setModalStatus(status);
  };
  const closeModal = () => {
    setModalItem(null);
    setModalStatus(null);
  };

  const totalRows = dataKinerjaPJPL.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));
  const displayedData = useMemo(() => {
    const start = page * limit;
    return dataKinerjaPJPL.slice(start, start + limit);
  }, [dataKinerjaPJPL, page, limit]);

  // Kelompokkan baris berurutan dengan Pegawai Kontrak sama (untuk rowSpan)
  const groupedByPegawai = useMemo(() => {
    if (!displayedData?.length) return [];
    const groups = [];
    let i = 0;
    while (i < displayedData.length) {
      const item = displayedData[i];
      const key = item.kontrakPJPL?.pegawai?.id ?? item.kontrakPJPLId ?? i;
      const group = [];
      while (
        i < displayedData.length &&
        (displayedData[i].kontrakPJPL?.pegawai?.id ??
          displayedData[i].kontrakPJPLId) ===
          (item.kontrakPJPL?.pegawai?.id ?? item.kontrakPJPLId)
      ) {
        group.push({
          item: displayedData[i],
          no: page * limit + i + 1,
        });
        i++;
      }
      groups.push({
        pegawai: item.kontrakPJPL?.pegawai,
        group,
      });
    }
    return groups;
  }, [displayedData, page, limit]);

  async function fetchDataKinerjaPJPL(resetPage = true) {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/rencana-hasil-kerja/${user[0]?.pegawaiId}`,
      );
      setDataKinerjaPJPL(res.data.result || []);
      if (resetPage) setPage(0);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal mengambil data kinerja PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDataKinerjaPJPL();
  }, []);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const updateStatus = async (id, statusBaru, onSuccess) => {
    setUpdatingId(id);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/update/kinerja-pjpl/${id}`,
        { status: statusBaru }
      );
      toast({
        title: "Berhasil",
        description: `Status diubah menjadi ${statusBaru === "disetujui" ? "diterima" : "ditolak"}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      fetchDataKinerjaPJPL(false);
      onSuccess?.();
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
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={{ base: 4, md: "30px" }}>
        <Container
          maxW={"1280px"}
          variant={"primary"}
          p={{ base: 4, md: "30px" }}
          my={"30px"}
        >
          <Heading size="lg" mb={6} color="gray.700">
            Verifikasi Rencana Aksi Kerja
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Daftar rencana hasil kerja PJPL yang perlu diverifikasi
          </Text>
          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : (
            <>
              <Box
                overflowX="auto"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
                shadow="sm"
              >
                <Table variant={"pegawai"} size="sm">
                  <Thead>
                    <Tr>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        No
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Pegawai Kontrak
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Indikator
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Rencana Hasil Kerja
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Target
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Satuan
                      </Th>
                      <Th
                        borderColor={"white"}
                        border={"1px"}
                        colSpan={2}
                        textAlign="center"
                      >
                        Periode Kontrak
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Status
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Tanggal Dibuat
                      </Th>
                      <Th rowSpan={2} borderColor={"white"} border={"1px"}>
                        Aksi
                      </Th>
                    </Tr>
                    <Tr>
                      <Th borderColor={"white"} border={"1px"}>
                        {" "}
                        Awal
                      </Th>
                      <Th borderColor={"white"} border={"1px"}>
                        {" "}
                        Akhir
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody bgColor={"secondary"}>
                    {groupedByPegawai.length > 0 ? (
                      groupedByPegawai.flatMap(({ pegawai, group }, groupIndex) =>
                        group.map(({ item }, idx) => (
                          <Tr key={item.id} _hover={{ bg: "gray.50" }}>
                            {idx === 0 ? (
                              <>
                                <Td rowSpan={group.length} verticalAlign="top" textAlign="center">
                                  {groupIndex + 1}
                                </Td>
                                <Td rowSpan={group.length} verticalAlign="top">
                                  <Text fontWeight="medium">
                                    {pegawai?.nama || "-"}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {pegawai?.jabatan || ""}
                                  </Text>
                                </Td>
                              </>
                            ) : null}
                            <Td whiteSpace="nowrap">
                              {item.indikatorPejabat?.indikator || "-"}
                            </Td>
                            <Td>{item.indikator || "-"}</Td>
                            <Td>{item.target ?? "-"}</Td>
                            <Td>{item.satuan || "-"}</Td>
                            <Td whiteSpace="nowrap">
                              {item.kontrakPJPL?.tanggalAwal
                                ? formatDate(item.kontrakPJPL.tanggalAwal)
                                : "-"}
                            </Td>
                            <Td whiteSpace="nowrap">
                              {item.kontrakPJPL?.tanggalAkhir
                                ? formatDate(item.kontrakPJPL.tanggalAkhir)
                                : "-"}
                            </Td>
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
                            <Td whiteSpace="nowrap">
                              {item.createdAt
                                ? formatDate(item.createdAt)
                                : "-"}
                            </Td>
                            <Td whiteSpace="nowrap">
                              {(() => {
                                const statusLower = item.status?.toLowerCase?.() ?? "";
                                const sudahDiterima = ["disetujui", "diterima"].includes(statusLower);
                                const sudahDitolak = statusLower === "ditolak";
                                const tampilkanTerima = !sudahDiterima;
                                const tampilkanTolak = !sudahDitolak;
                                if (!tampilkanTerima && !tampilkanTolak) {
                                  return (
                                    <Text fontSize="sm" color="gray.500">
                                      -
                                    </Text>
                                  );
                                }
                                return (
                                  <HStack spacing={2}>
                                    {tampilkanTerima && (
                                      <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() =>
                                          openModal(item, "disetujui")
                                        }
                                        isLoading={updatingId === item.id}
                                        loadingText="..."
                                      >
                                        Terima
                                      </Button>
                                    )}
                                    {tampilkanTolak && (
                                      <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() =>
                                          openModal(item, "ditolak")
                                        }
                                        isLoading={updatingId === item.id}
                                        loadingText="..."
                                      >
                                        Tolak
                                      </Button>
                                    )}
                                  </HStack>
                                );
                              })()}
                            </Td>
                          </Tr>
                        )),
                      )
                    ) : (
                      <Tr>
                        <Td colSpan={11} textAlign="center" py={"40px"}>
                          <VStack spacing={2}>
                            <Text color="gray.500">
                              Tidak ada data kinerja PJPL
                            </Text>
                          </VStack>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
              {totalRows > 0 && (
                <>
                  <Flex
                    mt={4}
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Text fontSize="sm" color="gray.600">
                      Menampilkan {page * limit + 1} -{" "}
                      {Math.min(page * limit + limit, totalRows)} dari{" "}
                      {totalRows} data
                    </Text>
                    <ReactPaginate
                      previousLabel={<BsCaretLeftFill />}
                      nextLabel={<BsCaretRightFill />}
                      pageCount={totalPages}
                      onPageChange={changePage}
                      forcePage={page}
                      activeClassName={"item active "}
                      breakClassName={"item break-me "}
                      breakLabel={"..."}
                      containerClassName={"pagination"}
                      disabledClassName={"disabled-page"}
                      marginPagesDisplayed={2}
                      nextClassName={"item next "}
                      pageClassName={"item pagination-page "}
                      pageRangeDisplayed={2}
                      previousClassName={"item previous"}
                    />
                  </Flex>
                </>
              )}
            </>
          )}

          <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                Konfirmasi Ubah Status —{" "}
                {modalStatus === "disetujui" ? "Diterima" : "Ditolak"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {modalItem && (
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="sm" color="gray.600">
                      Data yang akan diubah statusnya:
                    </Text>
                    <Divider />
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Pegawai Kontrak
                        </Text>
                        <Text fontWeight="medium">
                          {modalItem.kontrakPJPL?.pegawai?.nama || "-"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {modalItem.kontrakPJPL?.pegawai?.jabatan || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Indikator
                        </Text>
                        <Text>
                          {modalItem.indikatorPejabat?.indikator || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Rencana Hasil Kerja
                        </Text>
                        <Text>{modalItem.indikator || "-"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Target / Satuan
                        </Text>
                        <Text>
                          {modalItem.target ?? "-"} {modalItem.satuan || ""}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Tanggal Awal Kontrak
                        </Text>
                        <Text>
                          {modalItem.kontrakPJPL?.tanggalAwal
                            ? formatDate(modalItem.kontrakPJPL.tanggalAwal)
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Tanggal Akhir Kontrak
                        </Text>
                        <Text>
                          {modalItem.kontrakPJPL?.tanggalAkhir
                            ? formatDate(modalItem.kontrakPJPL.tanggalAkhir)
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Status saat ini
                        </Text>
                        <Badge
                          colorScheme={
                            modalItem.status === "diajukan"
                              ? "blue"
                              : modalItem.status === "disetujui" ||
                                  modalItem.status === "diterima"
                                ? "green"
                                : modalItem.status === "ditolak"
                                  ? "red"
                                  : "gray"
                          }
                        >
                          {modalItem.status || "-"}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">
                          Status baru
                        </Text>
                        <Badge
                          colorScheme={
                            modalStatus === "disetujui" ? "green" : "red"
                          }
                        >
                          {modalStatus === "disetujui" ? "Diterima" : "Ditolak"}
                        </Badge>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  colorScheme={
                    modalStatus === "disetujui" ? "green" : "red"
                  }
                  variant={modalStatus === "ditolak" ? "outline" : "solid"}
                  isLoading={updatingId === modalItem?.id}
                  loadingText="..."
                  onClick={() =>
                    updateStatus(modalItem?.id, modalStatus, closeModal)
                  }
                >
                  {modalStatus === "disetujui" ? "Terima" : "Tolak"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default VerifikasiRencanaAksiKerja;
