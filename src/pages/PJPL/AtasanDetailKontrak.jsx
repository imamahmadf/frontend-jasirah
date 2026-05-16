import React, { useState, useEffect } from "react";
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
  ModalCloseButton,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Input,
  useToast,
  Badge,
  VStack,
  Divider,
  Flex,
  Spacer,
  useDisclosure,
  Center,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
function AtasanDetailKontrak(props) {
  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataPejabat, setDataPejabat] = useState(null);
  const [dataKinerjaPJPL, setDataKinerjaPJPL] = useState([]);
  const [dataRealisasiPJPL, setDataRealisasiPJPL] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRealisasi, setIsLoadingRealisasi] = useState(false);
  const history = useHistory();
  const user = useSelector(userRedux);
  const toast = useToast();
  const role = useSelector(selectRole);
  const [pegawaiId, setPegawaiId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const [indikatorPejabatId, setIndikatorPejabatId] = useState(null);
  const [rencanaHasilKerja, setRencanaHasilKerja] = useState("");
  const [target, setTarget] = useState("");
  const [bulanRealisasi, setBulanRealisasi] = useState(null);
  const [tahunRealisasi, setTahunRealisasi] = useState(null);
  const [selectedKinerjaPJPLIds, setSelectedKinerjaPJPLIds] = useState([]);
  const [statusRealisasi, setStatusRealisasi] = useState("diajukan");
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isRealisasiOpen,
    onOpen: onRealisasiOpen,
    onClose: onRealisasiClose,
  } = useDisclosure();

  // async function fetchDataKontrak() {
  //   await axios
  //     .get(
  //       `${
  //         import.meta.env.VITE_REACT_APP_API_BASE_URL
  //       }/PJPL/get/detail-kontrak/${props.match.params.id}`
  //     )
  //     .then((res) => {
  //       setDataPejabat(res.data.result);

  //       console.log(res.data.result);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }

  async function fetchDataIndikatorPejabat() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/indikator-kinerja/${user[0].unitKerja_profile.id}`
      )
      .then((res) => {
        setDataPejabat(res.data.result);

        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataKinerjaPJPL() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/kinerja-pjpl?kontrakPJPLId=${props.match.params.id}`
      );
      setDataKinerjaPJPL(res.data.result || []);
      console.log(res.data.result);
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

  async function fetchDataRealisasiPJPL() {
    setIsLoadingRealisasi(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/realisasi-pjpl?kontrakPJPLId=${props.match.params.id}`
      );
      setDataRealisasiPJPL(res.data.result || []);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal mengambil data realisasi PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingRealisasi(false);
    }
  }
  const handleResetForm = () => {
    setIndikatorPejabatId(null);
    setRencanaHasilKerja("");
    setTarget("");
  };

  const handleResetFormRealisasi = () => {
    setBulanRealisasi(null);
    setTahunRealisasi(null);
    setSelectedKinerjaPJPLIds([]);
    setStatusRealisasi("diajukan");
  };

  // Fungsi untuk menghitung tanggal awal dan akhir berdasarkan bulan dan tahun
  const getTanggalAwalAkhir = (bulan, tahun) => {
    if (!bulan || !tahun) return { tanggalAwal: null, tanggalAkhir: null };

    // Tanggal awal selalu tanggal 1
    const tanggalAwal = new Date(tahun, bulan - 1, 1);

    // Tanggal akhir adalah hari terakhir di bulan tersebut
    const tanggalAkhir = new Date(tahun, bulan, 0);

    // Format ke YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      tanggalAwal: formatDate(tanggalAwal),
      tanggalAkhir: formatDate(tanggalAkhir),
    };
  };

  const tambahRealisasiPJPL = async () => {
    // Validasi form
    if (!selectedKinerjaPJPLIds || selectedKinerjaPJPLIds.length === 0) {
      toast({
        title: "Error!",
        description: "Pilih minimal satu indikator",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!bulanRealisasi) {
      toast({
        title: "Error!",
        description: "Pilih bulan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!tahunRealisasi) {
      toast({
        title: "Error!",
        description: "Pilih tahun",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Hitung tanggal awal dan akhir berdasarkan bulan dan tahun
    const { tanggalAwal, tanggalAkhir } = getTanggalAwalAkhir(
      bulanRealisasi,
      tahunRealisasi
    );

    try {
      // Kirim data dengan array kinerjaPJPLId
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/post/realisasi-pjpl`,
        {
          tanggalAwal,
          tanggalAkhir,
          kinerjaPJPLId: selectedKinerjaPJPLIds,
          status: statusRealisasi,
        }
      );

      toast({
        title: "Berhasil!",
        description: "Data realisasi PJPL berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleResetFormRealisasi();
      onRealisasiClose();
      fetchDataKinerjaPJPL();
      fetchDataRealisasiPJPL();
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

  const tambahIndikatorKinerja = () => {
    // Validasi form
    if (!indikatorPejabatId) {
      toast({
        title: "Error!",
        description: "Pilih RENCANA HASIL KERJA PIMPINAN YANG DIINTERVENSI",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!rencanaHasilKerja.trim()) {
      toast({
        title: "Error!",
        description: "Masukkan RENCANA HASIL KERJA",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!target || target <= 0) {
      toast({
        title: "Error!",
        description: "Masukkan target yang valid",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/post/kinerja-pjpl`,
        {
          indikatorPejabatId,
          rencanaHasilKerja,
          target: parseInt(target),
          kontrakPJPLId: props.match.params.id,
        }
      )
      .then((res) => {
        console.log(res.status, res.data);
        toast({
          title: "Berhasil!",
          description: "Data indikator kinerja berhasil ditambahkan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleResetForm();
        onTambahClose();
        fetchDataIndikatorPejabat();
        fetchDataKinerjaPJPL();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: err.response?.data?.message || "Data gagal ditambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    // fetchDataKontrak();
    fetchDataIndikatorPejabat();
    fetchDataKinerjaPJPL();
    fetchDataRealisasiPJPL();
  }, []);

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        {/* Tabel Realisasi PJPL */}
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={"30px"} fontSize={"28px"}>
            Data Realisasi PJPL
          </Heading>
          {isLoadingRealisasi ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : (
            <Table variant={"pegawai"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Periode</Th>

                  <Th>Jumlah Hasil Kerja</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody bgColor={"secondary"}>
                {dataRealisasiPJPL && dataRealisasiPJPL.length > 0 ? (
                  dataRealisasiPJPL.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>
                        {item.tanggalAwal && item.tanggalAkhir
                          ? `${new Date(item.tanggalAwal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )} - ${new Date(
                              item.tanggalAkhir
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "-"}
                      </Td>

                      <Td>{item.hasilKerjaPJPLs?.length || 0} hasil kerja</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() =>
                            history.push(
                              `/kepegawaian-ASN/atasan/penilaian/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={"30px"}>
                      <Text>Tidak ada data realisasi PJPL</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Container>
      </Box>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isTambahOpen}
        onClose={() => {
          handleResetForm();
          onTambahClose();
        }}
      >
        <ModalOverlay />
        <ModalContent borderRadius={0} maxWidth="1200px">
          <ModalHeader></ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box>
              <HStack>
                <Box bgColor={"pegawai"} width={"30px"} height={"30px"}></Box>
                <Heading color={"pegawai"}>Tambah indikator</Heading>
              </HStack>

              <SimpleGrid columns={2} spacing={10} p={"30px"}>
                <FormControl border={0}>
                  <FormLabel fontSize={"24px"}>
                    RENCANA HASIL KERJA PIMPINAN YANG DIINTERVENSI
                  </FormLabel>
                  <Select2
                    options={dataPejabat?.map((val) => ({
                      value: val.id,
                      label: `${val.indikator}`,
                    }))}
                    value={
                      indikatorPejabatId
                        ? dataPejabat?.find(
                            (val) => val.id === indikatorPejabatId
                          )
                          ? {
                              value: indikatorPejabatId,
                              label: dataPejabat.find(
                                (val) => val.id === indikatorPejabatId
                              ).indikator,
                            }
                          : null
                        : null
                    }
                    placeholder="Contoh: Laboratorium kesehatan daerah"
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setIndikatorPejabatId(
                        selectedOption ? selectedOption.value : null
                      );
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
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>{" "}
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>RENCANA HASIL KERJA</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    value={rencanaHasilKerja}
                    onChange={(e) => setRencanaHasilKerja(e.target.value)}
                    placeholder="Contoh: E"
                  />
                </FormControl>{" "}
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>TARGET</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Contoh: 2"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </ModalBody>

          <ModalFooter pe={"60px"} pb={"30px"}>
            <Button
              variant={"outline"}
              mr={3}
              onClick={() => {
                handleResetForm();
                onTambahClose();
              }}
            >
              Batal
            </Button>
            <Button onClick={tambahIndikatorKinerja} variant={"primary"}>
              Tambah Indikator
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Realisasi PJPL */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isRealisasiOpen}
        onClose={() => {
          handleResetFormRealisasi();
          onRealisasiClose();
        }}
      >
        <ModalOverlay />
        <ModalContent borderRadius={0} maxWidth="1200px">
          <ModalHeader></ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box>
              <HStack>
                <Box bgColor={"pegawai"} width={"30px"} height={"30px"}></Box>
                <Heading color={"pegawai"}>Tambah Realisasi PJPL</Heading>
              </HStack>

              <SimpleGrid columns={1} spacing={10} p={"30px"}>
                <FormControl>
                  <FormLabel fontSize={"24px"}>
                    Pilih Indikator (Bisa lebih dari 1)
                  </FormLabel>
                  <Select2
                    isMulti
                    options={dataKinerjaPJPL?.map((val) => ({
                      value: val.id,
                      label: `${val.indikatorPejabat?.indikator || "-"} - ${
                        val.indikator || "-"
                      }`,
                    }))}
                    value={selectedKinerjaPJPLIds
                      .map((id) => {
                        const item = dataKinerjaPJPL.find(
                          (val) => val.id === id
                        );
                        return item
                          ? {
                              value: item.id,
                              label: `${
                                item.indikatorPejabat?.indikator || "-"
                              } - ${item.indikator || "-"}`,
                            }
                          : null;
                      })
                      .filter(Boolean)}
                    placeholder="Pilih indikator dan rencana hasil kerja"
                    focusBorderColor="red"
                    onChange={(selectedOptions) => {
                      setSelectedKinerjaPJPLIds(
                        selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : []
                      );
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
                        minHeight: "60px",
                        _hover: {
                          borderColor: "yellow.700",
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: "aset",
                        color: "white",
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: "white",
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: "white",
                        _hover: {
                          backgroundColor: "red.500",
                          color: "white",
                        },
                      }),
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={10} p={"30px"}>
                <FormControl>
                  <FormLabel fontSize={"24px"}>Bulan</FormLabel>
                  <Select2
                    options={[
                      { value: 1, label: "Januari" },
                      { value: 2, label: "Februari" },
                      { value: 3, label: "Maret" },
                      { value: 4, label: "April" },
                      { value: 5, label: "Mei" },
                      { value: 6, label: "Juni" },
                      { value: 7, label: "Juli" },
                      { value: 8, label: "Agustus" },
                      { value: 9, label: "September" },
                      { value: 10, label: "Oktober" },
                      { value: 11, label: "November" },
                      { value: 12, label: "Desember" },
                    ]}
                    value={
                      bulanRealisasi
                        ? {
                            value: bulanRealisasi,
                            label: [
                              "Januari",
                              "Februari",
                              "Maret",
                              "April",
                              "Mei",
                              "Juni",
                              "Juli",
                              "Agustus",
                              "September",
                              "Oktober",
                              "November",
                              "Desember",
                            ][bulanRealisasi - 1],
                          }
                        : null
                    }
                    placeholder="Pilih Bulan"
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setBulanRealisasi(
                        selectedOption ? selectedOption.value : null
                      );
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
                  <FormLabel fontSize={"24px"}>Tahun</FormLabel>
                  <Select2
                    options={Array.from({ length: 10 }, (_, i) => {
                      const tahun = new Date().getFullYear() - 5 + i;
                      return { value: tahun, label: tahun.toString() };
                    })}
                    value={
                      tahunRealisasi
                        ? {
                            value: tahunRealisasi,
                            label: tahunRealisasi.toString(),
                          }
                        : null
                    }
                    placeholder="Pilih Tahun"
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setTahunRealisasi(
                        selectedOption ? selectedOption.value : null
                      );
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
                  <FormLabel fontSize={"24px"}>Status</FormLabel>
                  <Select2
                    options={[
                      { value: "diajukan", label: "Diajukan" },
                      { value: "disetujui", label: "Disetujui" },
                      { value: "ditolak", label: "Ditolak" },
                    ]}
                    value={
                      statusRealisasi
                        ? {
                            value: statusRealisasi,
                            label:
                              statusRealisasi === "diajukan"
                                ? "Diajukan"
                                : statusRealisasi === "disetujui"
                                ? "Disetujui"
                                : "Ditolak",
                          }
                        : null
                    }
                    placeholder="Pilih Status"
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setStatusRealisasi(
                        selectedOption ? selectedOption.value : "diajukan"
                      );
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

          <ModalFooter pe={"60px"} pb={"30px"}>
            <Button
              variant={"outline"}
              mr={3}
              onClick={() => {
                handleResetFormRealisasi();
                onRealisasiClose();
              }}
            >
              Batal
            </Button>
            <Button onClick={tambahRealisasiPJPL} variant={"primary"}>
              Tambah Realisasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default AtasanDetailKontrak;
