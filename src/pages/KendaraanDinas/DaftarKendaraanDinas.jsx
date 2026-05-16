import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../Componets/Layout";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Heading,
  SimpleGrid,
  Th,
  Td,
  Flex,
  Tooltip,
  Input,
  useToast,
  useColorMode,
  Badge,
  Skeleton,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { BsTrash, BsSearch, BsXCircle, BsEye, BsInfoCircle } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function DaftarKendaraanDinas() {
  const [DataKendaraan, setDataKendaraan] = useState([]);
  const [DataKendaraanDinas, setDataKendaraanDinas] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(0);
  const [pegawaiId, setPegawaiId] = useState(0);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [nomorPlat, setNomorPlat] = useState("");
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [kendaraanId, setKendaraanId] = useState(0);
  const [kendaraanTerpilih, setKendaraanTerpilih] = useState(null);
  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [tujuan, setTujuan] = useState("");
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  // State untuk modal hapus
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [kendaraanToDelete, setKendaraanToDelete] = useState(null);
  const [perjalananToDelete, setPerjalananToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  async function fetchDataKendaraanDinas() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan-dinas/get`
      );
      setDataKendaraanDinas(res.data.result ?? []);
      setDataUnitKerja(res.data.resultUnitKerja ?? []);
      setPage(res.data.page ?? 0);
      setPages(res.data.totalPage ?? 0);
      setRows(res.data.totalRows ?? 0);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal memuat data",
        description: "Silakan refresh halaman atau coba lagi nanti.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDataKendaraan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan/get/induk-unit-kerja/${
          user[0]?.unitKerja_profile.indukUnitKerja.id
        }`
      )
      .then((res) => {
        setDataKendaraan(res.data.result);

        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Fungsi untuk menghapus kendaraan dinas
  const handleDeleteKendaraan = async () => {
    if (!kendaraanToDelete || !perjalananToDelete) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan-dinas/delete/${kendaraanToDelete}`,
        {
          perjalananId: perjalananToDelete,
        }
      );

      toast({
        title: "Berhasil",
        description: "Data kendaraan dinas berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data setelah berhasil hapus
      fetchDataKendaraanDinas();
      onDeleteClose();
      setKendaraanToDelete(null);
      setPerjalananToDelete(null);
    } catch (error) {
      console.error("Error deleting kendaraan dinas:", error);
      toast({
        title: "Gagal",
        description: "Gagal menghapus data kendaraan dinas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk membuka modal hapus
  const openDeleteModal = (kendaraanId, perjalananId) => {
    setKendaraanToDelete(kendaraanId);
    setPerjalananToDelete(perjalananId);
    onDeleteOpen();
  };

  const resetFilter = () => {
    setPegawaiFilterId(0);
    setUnitKerjaFilterId(0);
    setTanggalAwal("");
    setTanggalAkhir("");
  };

  useEffect(() => {
    fetchDataKendaraanDinas();
    fetchDataKendaraan();
  }, [
    page,
    // unitKerjaFilterId,
    // pegawaiFilterId,
    // nomorPlat,
    // tanggalAkhir,
    // tanggalAwal,
  ]);
  return (
    <>
      <Layout>
        <Box bgColor={"secondary"} pb={"40px"} px={{ base: 4, md: "30px" }}>
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={{ base: 4, md: "30px" }}
            borderRadius={"8px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow={colorMode === "dark" ? "none" : "sm"}
          >
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
              mb={6}
            >
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Daftar Kendaraan Dinas
              </Heading>
            </Flex>

            <Box
              mb={6}
              p={4}
              borderRadius="lg"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600" _dark={{ color: "gray.300" }}>
                  Filter
                </Text>
                <Button
                  size="sm"
                  leftIcon={<BsXCircle />}
                  variant="ghost"
                  colorScheme="gray"
                  onClick={resetFilter}
                >
                  Reset filter
                </Button>
              </Flex>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              <FormControl>
                <FormLabel fontSize={"sm"} fontWeight="medium">
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
                  placeholder="Ketik Nama Pegawai"
                  onChange={(selectedOption) => {
                    setPegawaiFilterId(selectedOption?.value ?? 0);
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
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl border={0}>
                <FormLabel fontSize={"sm"} fontWeight="medium">
                  Unit Kerja
                </FormLabel>
                <Select2
                  options={dataUnitKerja?.map((val) => ({
                    value: val.id,
                    label: val.unitKerja || val.nama || "-",
                  })) ?? []}
                  placeholder="Pilih unit kerja"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setUnitKerjaFilterId(selectedOption?.value ?? 0);
                  }}
                  components={{
                    DropdownIndicator: () => null, // Hilangkan tombol panah
                    IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
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
                      _hover: {
                        borderColor: "yellow.700",
                      },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize={"sm"} fontWeight="medium">
                  Tanggal Awal
                </FormLabel>
                <Input
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                  height={"40px"}
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize={"sm"} fontWeight="medium">
                  Tanggal Akhir
                </FormLabel>
                <Input
                  type="date"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                  height={"40px"}
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                />
              </FormControl>
              </SimpleGrid>
            </Box>

            {isLoading ? (
              <VStack spacing={4} py={8} align="stretch">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height="56px" borderRadius="md" />
                ))}
              </VStack>
            ) : !DataKendaraanDinas?.length ? (
              <VStack py={12} spacing={4} color="gray.500">
                <BsInfoCircle size={48} />
                <Text fontWeight="medium">Belum ada data kendaraan dinas</Text>
                <Text fontSize="sm" textAlign="center">
                  Data peminjaman kendaraan dinas akan tampil di sini.
                </Text>
              </VStack>
            ) : (
              <>
            <Flex
              mb={3}
              fontSize="sm"
              color="gray.600"
              _dark={{ color: "gray.400" }}
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
            >
              <Text>
                Menampilkan <strong>{DataKendaraanDinas?.length}</strong> data
                {rows > 0 && ` dari ${rows} total`}
              </Text>
            </Flex>
            <Box overflowX="auto" mb={4} borderRadius="lg" borderWidth="1px" borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}>
            <Table
              variant="primary"
              size="sm"
              minWidth="900px"
              sx={{
                "thead th": {
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bg: colorMode === "dark" ? "gray.800" : "white",
                  boxShadow: "sm",
                },
              }}
            >
              <Thead>
                <Tr>
                  <Th>Kendaraan</Th>
                  <Th>Nomor Plat</Th>
                  <Th>Perjalanan</Th>
                  <Th>Personil</Th>
                  <Th>Tujuan</Th>
                  <Th>Tanggal</Th>
                  <Th>Bukti</Th>
                  <Th>Status</Th>
                  <Th>Jarak</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {DataKendaraanDinas?.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>
                      <Image
                        borderRadius={"5px"}
                        alt="foto kendaraan"
                        width="80px"
                        height="100px"
                        overflow="hidden"
                        objectFit="cover"
                        src={
                          item?.kendaraan?.foto
                            ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                              item?.kendaraan?.foto
                            : Foto
                        }
                      />
                    </Td>
                    <Td>{`KT ${item?.kendaraan?.nomor} ${
                      item?.kendaraan?.seri || ""
                    }`}</Td>
                    <Td>
                      <Box>
                        <Text fontSize="14px" fontWeight="bold" color="primary">
                          Total: {item?.perjalanans?.length || 0} perjalanan
                        </Text>
                        {item?.perjalanans?.map((perjalanan, idx) => (
                          <Box key={perjalanan.id} mb={2}>
                            <Text fontSize="12px">
                              Perjalanan {idx + 1}: ID {perjalanan.id}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box maxW="180px">
                        {item?.perjalanans?.map((perjalanan, idx) => (
                          <Box key={perjalanan.id} mb={2}>
                            {perjalanan?.personils?.map((personil) => (
                              <Text key={personil.id} fontSize="xs" noOfLines={1}>
                                {personil?.pegawai?.nama || "N/A"}
                              </Text>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box maxW="200px">
                        {item?.perjalanans?.map((perjalanan, idx) => (
                          <Box key={perjalanan.id} mb={2}>
                            {perjalanan?.tempats?.map((tempat, tIdx) => (
                              <Box key={tIdx}>
                                <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                  {tempat?.tempat || "N/A"}
                                </Text>
                                {tempat?.dalamKota && (
                                  <Text fontSize="10px" color="gray.600" noOfLines={1}>
                                    {tempat.dalamKota.nama}
                                  </Text>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        {item?.perjalanans && item?.perjalanans.length > 0 && (
                          <>
                            <Text fontSize="12px" fontWeight="bold">
                              Berangkat:{" "}
                              {(() => {
                                const firstPerjalanan = item.perjalanans?.[0];
                                const firstTempat =
                                  firstPerjalanan?.tempats?.[0];
                                const tanggalBerangkat =
                                  firstTempat?.tanggalBerangkat;

                                if (!tanggalBerangkat) return "-";

                                const date = new Date(tanggalBerangkat);

                                const optionsDate = {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                };

                                const optionsTime = {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                };

                                const tanggalFormatted =
                                  date.toLocaleDateString("id-ID", optionsDate);
                                const jamFormatted = date.toLocaleTimeString(
                                  "id-ID",
                                  optionsTime
                                );

                                return `${tanggalFormatted} pukul ${jamFormatted} WITA`;
                              })()}
                            </Text>

                            <Text fontSize="12px" fontWeight="bold">
                              Pulang:{" "}
                              {(() => {
                                const lastPerjalanan =
                                  item.perjalanans?.[
                                    item.perjalanans.length - 1
                                  ];
                                const lastTempat =
                                  lastPerjalanan?.tempats?.[
                                    lastPerjalanan.tempats.length - 1
                                  ];
                                const tanggalPulang = lastTempat?.tanggalPulang;

                                if (!tanggalPulang) return "-";

                                const date = new Date(tanggalPulang);

                                const optionsDate = {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                };

                                const optionsTime = {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                };

                                const tanggalFormatted =
                                  date.toLocaleDateString("id-ID", optionsDate);
                                const jamFormatted = date.toLocaleTimeString(
                                  "id-ID",
                                  optionsTime
                                );

                                return `${tanggalFormatted}, Pukul ${jamFormatted} WITA`;
                              })()}
                            </Text>

                            {item.perjalanans.length > 1 && (
                              <Text fontSize="10px" color="gray.500" mt={1}>
                                Detail per perjalanan:
                              </Text>
                            )}
                            {item.perjalanans.map((perjalanan, idx) => (
                              <Box key={perjalanan.id} mb={1}>
                                <Text fontSize="10px" color="gray.500">
                                  Perjalanan {idx + 1}:{" "}
                                  {new Date(
                                    perjalanan?.tanggalBerangkat
                                  ).toLocaleDateString("id-ID")}{" "}
                                  -{" "}
                                  {new Date(
                                    perjalanan?.tanggalPulang
                                  ).toLocaleDateString("id-ID")}
                                </Text>
                              </Box>
                            ))}
                          </>
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <Flex gap={2} direction="column">
                        <Text fontSize="12px" fontWeight="bold" color="primary">
                          KM Akhir:
                        </Text>
                        <Image
                          borderRadius={"5px"}
                          alt="foto km akhir"
                          width="80px"
                          height="60px"
                          overflow="hidden"
                          objectFit="cover"
                          src={
                            item?.kmAkhir
                              ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                                item?.kmAkhir
                              : Foto
                          }
                        />
                        <Text fontSize="12px" fontWeight="bold" color="primary">
                          Kondisi Akhir:
                        </Text>
                        <Image
                          borderRadius={"5px"}
                          alt="foto kondisi akhir"
                          width="80px"
                          height="60px"
                          overflow="hidden"
                          objectFit="cover"
                          src={
                            item?.kondisiAkhir
                              ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                                item?.kondisiAkhir
                              : Foto
                          }
                        />
                      </Flex>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={item?.status === "dipinjam" ? "red" : "green"}
                        variant={item?.status === "dipinjam" ? "solid" : "subtle"}
                        textTransform="capitalize"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {item?.status || "N/A"}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="medium">
                        {item?.jarak != null ? `${item.jarak} Km` : "–"}
                      </Text>
                    </Td>
                    <Td>
                      <Wrap spacing={2}>
                        <Tooltip label="Lihat detail kendaraan" placement="top">
                          <Button
                            onClick={() =>
                              history.push(
                                `/perjalanan/detail-kendaraan-dinas/${item?.kendaraan?.id}`
                              )
                            }
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<BsEye />}
                          >
                            Detail
                          </Button>
                        </Tooltip>
                        {item?.status === "dipinjam" && (
                          <Tooltip label="Batalkan / hapus peminjaman" placement="top">
                            <Button
                              onClick={() =>
                                openDeleteModal(
                                  item?.id,
                                  item?.perjalanans?.[0]?.id
                                )
                              }
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<BsTrash />}
                            >
                              Hapus
                            </Button>
                          </Tooltip>
                        )}
                      </Wrap>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            </Box>
            {pages > 1 && (
              <Flex justify="center" align="center" py={4} width="100%">
                <ReactPaginate
                  previousLabel="← Sebelumnya"
                  nextLabel="Selanjutnya →"
                  pageCount={Math.max(1, pages)}
                  onPageChange={changePage}
                  forcePage={page}
                  activeClassName="item active"
                  breakClassName="item break-me"
                  breakLabel="..."
                  containerClassName="pagination"
                  disabledClassName="disabled-page"
                  marginPagesDisplayed={1}
                  nextClassName="item next"
                  pageClassName="item pagination-page"
                  pageRangeDisplayed={2}
                  previousClassName="item previous"
                />
              </Flex>
            )}
              </>
            )}
          </Box>
        </Box>

        {/* Modal Konfirmasi Hapus */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="md">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent mx={4}>
            <ModalHeader>Konfirmasi Hapus</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text color="gray.600" _dark={{ color: "gray.300" }}>
                Apakah Anda yakin ingin menghapus data kendaraan dinas ini?
                Tindakan ini tidak dapat dibatalkan.
              </Text>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={onDeleteClose}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteKendaraan}
                leftIcon={<BsTrash />}
              >
                Hapus
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Layout>
    </>
  );
}

export default DaftarKendaraanDinas;
