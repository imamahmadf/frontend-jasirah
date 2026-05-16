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
function DetailKinerjaPJPL(props) {
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
  const [satuan, setSatuan] = useState("");
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
    setSatuan("");
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

  // Fungsi untuk mendapatkan daftar bulan dan tahun yang valid berdasarkan range kontrak
  const getValidBulanTahun = () => {
    const kontrak = dataKinerjaPJPL[0]?.kontrakPJPL;
    if (!kontrak || !kontrak.tanggalAwal || !kontrak.tanggalAkhir) {
      return { validBulan: [], validTahun: [], validBulanTahun: [] };
    }

    const tanggalAwal = new Date(kontrak.tanggalAwal);
    const tanggalAkhir = new Date(kontrak.tanggalAkhir);

    const validBulanTahun = [];
    const currentDate = new Date(tanggalAwal);

    // Iterasi dari tanggal awal sampai tanggal akhir per bulan
    while (currentDate <= tanggalAkhir) {
      const tahun = currentDate.getFullYear();
      const bulan = currentDate.getMonth() + 1; // getMonth() returns 0-11
      validBulanTahun.push({ bulan, tahun });

      // Pindah ke bulan berikutnya
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Ekstrak bulan dan tahun unik
    const validBulan = [...new Set(validBulanTahun.map((item) => item.bulan))];
    const validTahun = [...new Set(validBulanTahun.map((item) => item.tahun))];

    return { validBulan, validTahun, validBulanTahun };
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
          satuan,
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
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <HStack gap={5} mb={"30px"}>
            <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
              Tambah indikator kinerja +
            </Button>
            <Button onClick={onRealisasiOpen} variant={"primary"} px={"50px"}>
              Tambah Realisasi +
            </Button>
          </HStack>
          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : (
            <Table variant={"pegawai"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Indikator</Th>
                  <Th>Rencana Hasil Kerja</Th>
                  <Th>Target</Th>
                  <Th>Satuan</Th>
                  <Th>Status</Th>
                  <Th>Pegawai Kontrak</Th>
                  <Th>Pejabat Verifikator</Th>
                  <Th>Tanggal Dibuat</Th>
                </Tr>
              </Thead>
              <Tbody bgColor={"secondary"}>
                {dataKinerjaPJPL && dataKinerjaPJPL.length > 0 ? (
                  dataKinerjaPJPL.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{item.indikatorPejabat?.indikator || "-"}</Td>
                      <Td>{item.indikator || "-"}</Td>
                      <Td>{item.target || "-"}</Td>
                      <Td>{item.satuan || "-"}</Td>
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
                        {item.kontrakPJPL?.pegawai?.nama || "-"}
                        <br />
                        <Text fontSize="sm" color="gray.500">
                          {item.kontrakPJPL?.pegawai?.jabatan || ""}
                        </Text>
                      </Td>
                      <Td>
                        {item.indikatorPejabat?.pejabatVerifikator?.pegawai
                          ?.nama || "-"}
                        <br />
                        <Text fontSize="sm" color="gray.500">
                          {item.indikatorPejabat?.pejabatVerifikator?.pegawai
                            ?.jabatan || ""}
                        </Text>
                      </Td>
                      <Td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={"30px"}>
                      <Text>Tidak ada data kinerja PJPL</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Container>

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
                  <Th>Status</Th>
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
                      <Td>{item.hasilKerjaPJPLs?.length || 0} hasil kerja</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() =>
                            history.push(
                              `/kepegawaian/hasil-kerja-pjpl/${item.id}`
                            )
                          }
                        >
                          Lihat Hasil Kerja
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
                    placeholder="Catatan: Sesuaikan dengan SIMANDIRI"
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
                    placeholder="Catatan: isi dengan rinci"
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
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Satuan</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="text"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    placeholder="Contoh: Dokumen"
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
                    options={(() => {
                      const { validBulanTahun } = getValidBulanTahun();
                      const namaBulan = [
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
                      ];

                      // Jika tahun sudah dipilih, filter bulan berdasarkan tahun yang dipilih
                      if (tahunRealisasi) {
                        return (validBulanTahun || [])
                          .filter((item) => item?.tahun === tahunRealisasi)
                          .map((item) => ({
                            value: item?.bulan,
                            label: namaBulan[item?.bulan - 1],
                          }));
                      }

                      // Jika tahun belum dipilih, tampilkan semua bulan yang valid
                      return (validBulanTahun || [])
                        .map((item) => ({
                          value: item?.bulan,
                          label: `${namaBulan[item?.bulan - 1]} ${item?.tahun}`,
                          tahun: item?.tahun,
                        }))
                        .reduce((acc, curr) => {
                          // Hapus duplikat bulan (ambil yang pertama)
                          if (
                            !acc.find((item) => item?.value === curr?.value)
                          ) {
                            acc.push(curr);
                          }
                          return acc;
                        }, [])
                        .map((item) => ({
                          value: item?.value,
                          label: item?.label,
                        }));
                    })()}
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
                      const newBulan = selectedOption
                        ? selectedOption.value
                        : null;
                      setBulanRealisasi(newBulan);

                      // Jika bulan dipilih dan tahun belum dipilih, set tahun dari opsi yang dipilih
                      if (newBulan && !tahunRealisasi) {
                        const { validBulanTahun } = getValidBulanTahun();
                        const selectedItem = validBulanTahun.find(
                          (item) => item.bulan === newBulan
                        );
                        if (selectedItem) {
                          setTahunRealisasi(selectedItem.tahun);
                        }
                      }
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
                    options={(() => {
                      const { validBulanTahun } = getValidBulanTahun();

                      // Jika bulan sudah dipilih, filter tahun berdasarkan bulan yang dipilih
                      if (bulanRealisasi) {
                        return validBulanTahun
                          .filter((item) => item.bulan === bulanRealisasi)
                          .map((item) => ({
                            value: item.tahun,
                            label: item.tahun.toString(),
                          }));
                      }

                      // Jika bulan belum dipilih, tampilkan semua tahun yang valid
                      const uniqueTahun = [
                        ...new Set(validBulanTahun?.map((item) => item.tahun)),
                      ];
                      return uniqueTahun.map((tahun) => ({
                        value: tahun,
                        label: tahun.toString(),
                      }));
                    })()}
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
                      const newTahun = selectedOption
                        ? selectedOption.value
                        : null;
                      setTahunRealisasi(newTahun);

                      // Jika tahun dipilih dan bulan belum dipilih, set bulan dari opsi yang valid
                      if (newTahun && !bulanRealisasi) {
                        const { validBulanTahun } = getValidBulanTahun();
                        const selectedItem = validBulanTahun.find(
                          (item) => item.tahun === newTahun
                        );
                        if (selectedItem) {
                          setBulanRealisasi(selectedItem.bulan);
                        }
                      }

                      // Jika tahun berubah dan bulan yang dipilih tidak valid untuk tahun baru, reset bulan
                      if (newTahun && bulanRealisasi) {
                        const { validBulanTahun } = getValidBulanTahun();
                        const isValid = validBulanTahun.some(
                          (item) =>
                            item.bulan === bulanRealisasi &&
                            item.tahun === newTahun
                        );
                        if (!isValid) {
                          setBulanRealisasi(null);
                        }
                      }
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
                      // { value: "disetujui", label: "Disetujui" },
                      // { value: "ditolak", label: "Ditolak" },
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

export default DetailKinerjaPJPL;
