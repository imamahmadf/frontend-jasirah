import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import Foto from "../../assets/add_photo.png";
import { Link, useHistory } from "react-router-dom";
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
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useDisclosure,
  Heading,
  SimpleGrid,
  useColorMode,
  Checkbox,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BsEyeFill, BsThreeDotsVertical } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import "moment/locale/id";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Fungsi untuk menghasilkan warna unik dari nama pegawai
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

function DaftarPerjalananKendaraan() {
  const [dataPerjalanan, setDataPerjalanan] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [selectedPerjalanan, setSelectedPerjalanan] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [DataKendaraan, setDataKendaraan] = useState([]);
  const [kendaraanTerpilih, setKendaraanTerpilih] = useState(null);
  const [kendaraanId, setKendaraanId] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const bookingKendaraan = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan-dinas/booking`,
        {
          selectedIds,
          kendaraanId: parseInt(kendaraanTerpilih.id),
        }
      )
      .then(() => {
        toast({
          title: "Berhasil",
          description: "berhasil booking",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setKendaraanTerpilih(null);
        fetchDataPerjalanan();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const postSuratTugas = (val) => {
    setIsLoading(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/post/surat-tugas`,
        {
          asal: val.asal,
          jenis: val.jenisPerjalanan.id,
          kode: `${val.daftarSubKegiatan.kodeRekening}${val.jenisPerjalanan.kodeRekening}`,
          personilFE: val.personils,
          ttdSurTug: val.ttdSuratTuga,
          id: val.id,
          tanggalPengajuan: val.tanggalPengajuan,
          tempat: val.tempats,
          untuk: val.untuk,
          dasar: val.dasar,
          ttdSurTugJabatan: val.ttdSuratTuga.jabatan,
          ttdSurTugNama: val.ttdSuratTuga.pegawai.nama,
          ttdSurTugNip: val.ttdSuratTuga.pegawai.nip,
          ttdSurTugPangkat: val.ttdSuratTuga.pegawai.daftarPangkat.pangkat,
          ttdSurTugGolongan: val.ttdSuratTuga.pegawai.daftarGolongan.golongan,
          ttdSurTugUnitKerja: val.ttdSuratTuga.indukUnitKerjaId,
          ttdSurtTugKode:
            val.ttdSuratTuga.indukUnitKerja_ttdSuratTugas.kodeInduk,
          KPANama: val.KPA.pegawai_KPA.nama,
          KPANip: val.KPA.pegawai_KPA.nip,
          KPAPangkat: val.KPA.pegawai_KPA.daftarPangkat.pangkat,
          KPAGolongan: val.KPA.pegawai_KPA.daftarGolongan.golongan,
          KPAJabatan: val.KPA.jabatan,
          noNotaDinas: val.suratKeluar?.nomor || "",
          noSuratTugas: val.noSuratTugas,
          unitKerja: user[0]?.unitKerja_profile,
          indukUnitKerjaFE: user[0]?.unitKerja_profile,
        },
        {
          responseType: "blob", // Penting untuk menerima file sebagai blob
        }
      )
      .then((res) => {
        // Buat URL untuk file yang diunduh
        const url = window.URL.createObjectURL(new Blob([res.data])); // Perbaikan di sini
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Surat_Tugas_${user[0]?.unitKerja_profile?.kode}_${Date.now()}.docx`
        ); // Nama file yang diunduh
        document.body.appendChild(link);
        link.click();
        link.remove();
        fetchDataPerjalanan();

        toast({
          title: "Berhasil",
          description: "File surat tugas berhasil diunduh",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
        toast({
          title: "Gagal",
          description: "Gagal mengunduh file surat tugas",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const postSuratTugasKendaraan = (val) => {
    setIsLoading(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/post/surat-tugas-kendaraan`,
        {
          asal: val.asal,
          jenis: val.jenisPerjalanan.id,
          kode: `${val.daftarSubKegiatan.kodeRekening}${val.jenisPerjalanan.kodeRekening}`,
          personilFE: val.personils,
          ttdSurTug: val.ttdSuratTuga,
          id: val.id,
          tanggalPengajuan: val.tanggalPengajuan,
          tempat: val.tempats,
          untuk: val.untuk,
          dasar: val.dasar,
          ttdSurTugJabatan: val.ttdSuratTuga.jabatan,
          ttdSurTugNama: val.ttdSuratTuga.pegawai.nama,
          ttdSurTugNip: val.ttdSuratTuga.pegawai.nip,
          ttdSurTugPangkat: val.ttdSuratTuga.pegawai.daftarPangkat.pangkat,
          ttdSurTugGolongan: val.ttdSuratTuga.pegawai.daftarGolongan.golongan,
          ttdSurTugUnitKerja: val.ttdSuratTuga.indukUnitKerjaId,
          ttdSurtTugKode:
            val.ttdSuratTuga.indukUnitKerja_ttdSuratTugas.kodeInduk,
          KPANama: val.KPA.pegawai_KPA.nama,
          KPANip: val.KPA.pegawai_KPA.nip,
          KPAPangkat: val.KPA.pegawai_KPA.daftarPangkat.pangkat,
          KPAGolongan: val.KPA.pegawai_KPA.daftarGolongan.golongan,
          KPAJabatan: val.KPA.jabatan,
          noNotaDinas: val.suratKeluar?.nomor || "",
          noSuratTugas: val.noSuratTugas,
          unitKerja: user[0]?.unitKerja_profile,
          indukUnitKerjaFE: user[0]?.unitKerja_profile,
        },
        {
          responseType: "blob", // Penting untuk menerima file sebagai blob
        }
      )
      .then((res) => {
        fetchDataPerjalanan();

        toast({
          title: "Berhasil",
          description: "File surat tugas berhasil diunduh",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
        toast({
          title: "Gagal",
          description: "Gagal mengunduh file surat tugas",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
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
  async function fetchDataPerjalanan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/all-perjalanan-kendaraan?&time=${time}&page=${page}&limit=${limit}&indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}`
      )
      .then((res) => {
        setDataPerjalanan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataPerjalanan();

    fetchDataKendaraan();
  }, [page, tanggalAkhir, tanggalAwal]);

  // reset pilihan ketika kendaraan berganti/direset
  useEffect(() => {
    setSelectedIds([]);
  }, [kendaraanId]);

  // Mapping dataPerjalanan ke events untuk kalender, setiap personil jadi event terpisah
  const events = dataPerjalanan.flatMap((item) => {
    const start = item.tempats?.[0]?.tanggalBerangkat
      ? new Date(item.tempats[0].tanggalBerangkat)
      : null;
    const end = item.tempats?.[item.tempats.length - 1]?.tanggalPulang
      ? new Date(item.tempats[item.tempats.length - 1].tanggalPulang)
      : start;
    return (item.personils || []).map((p) => ({
      title: p.pegawai?.nama || "-",
      start,
      end,
      allDay: true,
      resource: item,
    }));
  });

  moment.locale("id");
  const localizer = momentLocalizer(moment);
  const formats = {
    dayFormat: (date, culture, localizer) =>
      format(date, "EEEE", { locale: idLocale }),
    weekdayFormat: (date, culture, localizer) =>
      format(date, "EEEEEE", { locale: idLocale }),
    monthHeaderFormat: (date, culture, localizer) =>
      format(date, "MMMM yyyy", { locale: idLocale }),
    dayHeaderFormat: (date, culture, localizer) =>
      format(date, "EEEE, d MMMM", { locale: idLocale }),
  };

  return (
    <>
      {isLoading && <Loading />}
      <Layout>
        {/* Kalender Perjalanan */}

        {dataPerjalanan[0] ? (
          <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
            <Box
              mt={"50px"}
              style={{ overflowX: "auto" }}
              bgColor={"white"}
              p={"30px"}
              borderRadius={"5px"}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <SimpleGrid columns={2} spacing={10} p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Pilih Kendaraan</FormLabel>
                  {/* {console.log("DataKendaraan:", DataKendaraan)} */}
                  <Select2
                    options={DataKendaraan?.map((val) => ({
                      value: val.id,
                      label: `KT ${val.nomor} ${val.seri} ${val.merek || "-"}`,
                      foto: val.foto,
                    }))}
                    placeholder="Pilih Kendaraan"
                    focusBorderColor="red"
                    value={
                      DataKendaraan?.find(
                        (kendaraan) => kendaraan.id === kendaraanId
                      )
                        ? {
                            value: kendaraanId,
                            label: `${
                              DataKendaraan.find(
                                (kendaraan) => kendaraan.id === kendaraanId
                              )?.nomor
                            } - ${
                              DataKendaraan.find(
                                (kendaraan) => kendaraan.id === kendaraanId
                              )?.seri
                            }`,
                            foto: DataKendaraan.find(
                              (kendaraan) => kendaraan.id === kendaraanId
                            )?.foto,
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      console.log("Selected kendaraan:", selectedOption);
                      setKendaraanId(selectedOption?.value || 0);
                      if (selectedOption) {
                        const kendaraanData = DataKendaraan?.find(
                          (k) => k.id === selectedOption.value
                        );
                        setKendaraanTerpilih(kendaraanData);
                      } else {
                        setKendaraanTerpilih(null);
                      }
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                      Option: ({
                        children,
                        innerProps,
                        innerRef,
                        ...props
                      }) => (
                        <Box
                          ref={innerRef}
                          {...innerProps}
                          display="flex"
                          alignItems="center"
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: "primary", color: "white" }}
                          bg={props.isFocused ? "primary" : "white"}
                          color={props.isFocused ? "white" : "black"}
                        >
                          <Image
                            src={
                              props.data.foto
                                ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                                  props.data.foto
                                : Foto
                            }
                            alt="foto kendaraan"
                            width="40px"
                            height="40px"
                            borderRadius="5px"
                            objectFit="cover"
                            mr={3}
                          />
                          <Text>{children}</Text>
                        </Box>
                      ),
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
                    }}
                  />
                </FormControl>

                {/* Tampilan Kendaraan Terpilih */}
                {kendaraanTerpilih && (
                  <FormControl my={"30px"}>
                    {/* Hapus JSON.stringify di UI */}
                    {/* {JSON.stringify(kendaraanTerpilih)} */}

                    <FormLabel fontSize={"24px"} mb={3}>
                      Kendaraan Terpilih
                    </FormLabel>

                    <Flex
                      p={4}
                      border="2px solid"
                      borderColor="primary"
                      borderRadius="8px"
                      bg="gray.50"
                    >
                      <HStack spacing={4}>
                        <Image
                          src={
                            kendaraanTerpilih.foto
                              ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                                kendaraanTerpilih.foto
                              : Foto
                          }
                          alt="foto kendaraan terpilih"
                          width="120px"
                          height="120px"
                          borderRadius="8px"
                          objectFit="cover"
                        />
                        <Box>
                          <Text fontSize="24px" fontWeight="bold">
                            {kendaraanTerpilih.merek}
                          </Text>

                          <Text
                            fontSize="18px"
                            fontWeight="bold"
                            color="primary"
                          >
                            {`KT ${kendaraanTerpilih.nomor} ${kendaraanTerpilih.seri}`}
                          </Text>

                          <Text>
                            Status:{" "}
                            {kendaraanTerpilih?.kendaraanDinas?.[0]?.status ||
                              "-"}
                          </Text>

                          {/* ✅ Tujuan Perjalanan */}
                          <Text mt={2} fontWeight="semibold" color="gray.700">
                            Tujuan:{" "}
                            {kendaraanTerpilih?.kendaraanDinas?.[0]
                              ?.perjalanans?.[0]?.tempats?.[0]?.dalamKota
                              ?.nama || "-"}
                          </Text>

                          {/* ✅ Tanggal Berangkat */}
                          <Text fontSize="14px" color="gray.600">
                            Berangkat:{" "}
                            {kendaraanTerpilih?.kendaraanDinas?.[0]
                              ?.perjalanans?.[0]?.tempats?.[0]?.tanggalBerangkat
                              ? new Date(
                                  kendaraanTerpilih.kendaraanDinas[0].perjalanans[0].tempats[0].tanggalBerangkat
                                ).toLocaleString("id-ID", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </Text>

                          {/* ✅ Tanggal Pulang */}
                          <Text fontSize="14px" color="gray.600">
                            Pulang:{" "}
                            {kendaraanTerpilih?.kendaraanDinas?.[0]
                              ?.perjalanans?.[0]?.tempats?.[0]?.tanggalPulang
                              ? new Date(
                                  kendaraanTerpilih.kendaraanDinas[0].perjalanans[0].tempats[0].tanggalPulang
                                ).toLocaleString("id-ID", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </Text>
                        </Box>
                      </HStack>

                      <Spacer />

                      <Button
                        onClick={bookingKendaraan}
                        variant={"primary"}
                        // isDisabled={
                        //   kendaraanTerpilih?.kendaraanDinas?.[0]?.status ===
                        //   "dipinjam"
                        // }
                      >
                        Booking
                      </Button>
                    </Flex>
                  </FormControl>
                )}
              </SimpleGrid>
              <Flex gap={4} mb={4}>
                <FormControl>
                  <FormLabel>Tanggal Berangkat (Awal)</FormLabel>
                  <Input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tanggal Pulang (Akhir)</FormLabel>
                  <Input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                  />
                </FormControl>
              </Flex>
              <Table variant={"primary"}>
                <Thead>
                  <Tr>
                    {kendaraanTerpilih && <Th>Pilih</Th>}
                    <Th>no.</Th>
                    <Th maxWidth={"20px"}>jenis Perjalanan</Th>

                    <Th>Unit Kerja Surat Tugas</Th>
                    <Th>No Surat Tugas</Th>

                    <Th>Kendaraan</Th>
                    <Th>Tanggal Berangkat</Th>
                    <Th>tanggal Pulang</Th>
                    <Th>Tujuan</Th>
                    <Th>Personil 1</Th>
                    <Th>Personil 2</Th>
                    <Th>Personil 3</Th>
                    <Th>Personil 4</Th>
                    <Th>Personil 5</Th>

                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataPerjalanan?.map((item, index) => (
                    <Tr key={item.id}>
                      {kendaraanTerpilih && (
                        <Td>
                          {item?.kendaraanDina?.id ? null : (
                            <Checkbox
                              isChecked={selectedIds.includes(item.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedIds((prev) =>
                                  checked
                                    ? [...prev, item.id]
                                    : prev.filter((id) => id !== item.id)
                                );
                              }}
                              colorScheme="green"
                            />
                          )}
                        </Td>
                      )}
                      <Td maxWidth={"20px"}>{index + 1}</Td>
                      <Td>{item.jenisPerjalanan.jenis}</Td>
                      <Td>
                        {
                          item.ttdSuratTuga.indukUnitKerja_ttdSuratTugas
                            .kodeInduk
                        }
                      </Td>
                      <Td>{item.noSuratTugas ? item?.noSuratTugas : "-"}</Td>

                      <Td>
                        {item?.kendaraanDina?.kendaraan?.nomor
                          ? `${
                              item?.kendaraanDina?.kendaraan?.merek || ""
                            } - KT ${item?.kendaraanDina?.kendaraan?.nomor} ${
                              item?.kendaraanDina?.kendaraan?.seri
                            }`
                          : "-"}
                      </Td>
                      <Td>
                        {item.tempats?.[0]?.tanggalBerangkat
                          ? new Date(
                              item.tempats[0].tanggalBerangkat
                            ).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </Td>
                      <Td>
                        {item.tempats?.[item.tempats.length - 1]?.tanggalPulang
                          ? new Date(
                              item.tempats[
                                item.tempats.length - 1
                              ].tanggalPulang
                            ).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </Td>
                      <Td>
                        {item.jenisPerjalanan.tipePerjalanan.id === 1
                          ? item.tempats.map((val) => (
                              <Text key={val.id}>{val.dalamKota.nama}</Text>
                            ))
                          : item.tempats.map((val) => (
                              <Text key={val.id}>{val.tempat}</Text>
                            ))}
                      </Td>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Td key={i}>
                          <Tooltip
                            label={item.personils?.[i]?.status?.statusKuitansi}
                            aria-label="A tooltip"
                            bgColor={
                              item.personils?.[i]?.statusId === 1
                                ? "gelap"
                                : item.personils?.[i]?.statusId === 2
                                ? "ungu"
                                : item.personils?.[i]?.statusId === 3
                                ? "primary"
                                : item.personils?.[i]?.statusId === 4
                                ? "danger"
                                : null
                            }
                          >
                            <Badge
                              display={"flex"}
                              alignItems={"center"}
                              gap={"1px"}
                              px={"8px"}
                              py={"3px"}
                              maxW={"250px"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              whiteSpace={"nowrap"}
                              borderRadius={"md"}
                              textTransform={"none"}
                              bgColor={
                                item.personils?.[i]?.statusId === 1
                                  ? "gelap"
                                  : item.personils?.[i]?.statusId === 2
                                  ? "ungu"
                                  : item.personils?.[i]?.statusId === 3
                                  ? "primary"
                                  : item.personils?.[i]?.statusId === 4
                                  ? "danger"
                                  : "gray.200"
                              }
                              color={
                                item.personils?.[i]?.statusId === 1 ||
                                item.personils?.[i]?.statusId === 2 ||
                                item.personils?.[i]?.statusId === 3 ||
                                item.personils?.[i]?.statusId === 4
                                  ? "white"
                                  : "gray.700"
                              }
                            >
                              {item.personils?.[i]?.pegawai?.nama || "-"}
                            </Badge>
                          </Tooltip>
                        </Td>
                      ))}
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<BsThreeDotsVertical />}
                            variant="ghost"
                            size="sm"
                            aria-label="Menu aksi"
                          />
                          <MenuList>
                            {item.noSuratTugas && (
                              <MenuItem
                                icon={<BsEyeFill />}
                                onClick={() =>
                                  history.push(`/detail-perjalanan/${item.id}`)
                                }
                              >
                                Lihat Detail
                              </MenuItem>
                            )}
                            <MenuItem
                              icon={<BsFileEarmarkArrowDown />}
                              onClick={() => postSuratTugas(item)}
                            >
                              Cetak Surat Tugas
                            </MenuItem>
                            <MenuItem
                              icon={<BsFileEarmarkArrowDown />}
                              onClick={() => postSuratTugasKendaraan(item)}
                            >
                              Cetak Surat Tugas Kendaraan
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",

                  boxSizing: "border-box",
                  width: "100%",
                  height: "100%",
                }}
              >
                <ReactPaginate
                  previousLabel={"+"}
                  nextLabel={"-"}
                  pageCount={pages}
                  onPageChange={changePage}
                  activeClassName={"item active "}
                  breakClassName={"item break-me "}
                  breakLabel={"..."}
                  containerClassName={"pagination"}
                  disabledClassName={"disabled-page"}
                  marginPagesDisplayed={1}
                  nextClassName={"item next "}
                  pageClassName={"item pagination-page "}
                  pageRangeDisplayed={2}
                  previousClassName={"item previous"}
                />
              </div>{" "}
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Konfirmasi Hapus</ModalHeader>
                  <ModalCloseButton />

                  <ModalBody>
                    Apakah Anda yakin ingin menghapus data ini?
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="red"
                      mr={3}
                      onClick={() => hapusPerjalanan(selectedPerjalanan)}
                    >
                      Ya, Hapus
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                      Batal
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>
          </Box>
        ) : (
          <DataKosong />
        )}
      </Layout>
    </>
  );
}

export default DaftarPerjalananKendaraan;
