import React, { useState, useEffect } from "react";
import axios from "axios";

import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";

import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import { BsDownload } from "react-icons/bs";
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
  Heading,
  SimpleGrid,
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";

import {
  BsThreeDotsVertical,
  BsEyeFill,
  BsFileEarmarkArrowDown,
} from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function DaftarKendaraan() {
  const [DataKendaraan, setDataKendaraan] = useState([]);
  const history = useHistory();
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const [unitKerjaId, setUnitKerjaId] = useState(0);
  const [pegawaiId, setPegawaiId] = useState(0);
  const [statusId, setStatusId] = useState(0);
  const [jenisId, setJenisId] = useState(0);
  const [kondisiId, setKondisiId] = useState(0);
  const [nomorMesin, setNomorMesin] = useState("");
  const [nomorRangka, setNomorRangka] = useState("");
  const [nomorKontak, setNomorKontak] = useState(0);
  const [nomor, setNomor] = useState(0);
  const [seri, setSeri] = useState("");
  const [time, setTime] = useState("");
  const [loadingItems, setLoadingItems] = useState({});
  const [loadingSurat, setLoadingSurat] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [dataPegawai, setDataPegawai] = useState(null);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [nomorPlat, setNomorPlat] = useState("");
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "nomor") {
      setNomor(parseInt(val));
    } else if (field == "seri") {
      setSeri(val);
    } else if (field == "nomorMesin") {
      setNomorMesin(val);
    } else if (field == "nomorRangka") {
      setNomorRangka(val);
    } else if (field == "nomorKontak") {
      setNomorKontak(parseInt(val));
    }
  };

  async function fetchDataPegawai() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`)
      .then((res) => {
        console.log(res.data, "tessss");
        setDataPegawai(res.data.result.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
  const cekPajak = (val) => {
    setLoadingItems((prev) => ({ ...prev, [val.id]: true }));
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/cek`, {
        id: val.id,
        nomor: val.nomor,
        seri: val.seri,
        phone: 6281350617579,
        kt: "KT",
      })
      .then((res) => {
        // Buat URL untuk file yang diunduh
        console.log(res.data);
        fetchDataKendaraan();

        toast({
          title: "Berhasil",
          description: res.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
        toast({
          title: "Gagal",
          description: "Gagal mengakses SIMPATOR  ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoadingItems((prev) => ({ ...prev, [val.id]: false }));
        setOpenMenuId(null);
      });
  };
  const cektakSurat = (val) => {
    setLoadingSurat((prev) => ({ ...prev, [val.id]: true }));
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/surat`,
        {
          nomorRangka: val.noRangka,
          nomorMesin: val.noMesin,
          unitKerja: val.kendaraanUK.unitKerja,
          plat: `KT ${val.nomor} ${val.seri}`,
          jenisKendaraan: val.jenisKendaraan.jenis,
          userId: user[0].id,
          kendaraanId: val.id,
        },
        {
          responseType: "blob", // Penting untuk menerima file sebagai blob
        }
      )
      .then((res) => {
        console.log(res.data); // Log respons dari backend

        // Buat URL untuk file yang diunduh
        const url = window.URL.createObjectURL(new Blob([res.data])); // Perbaikan di sini
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `surat_pengantar_KT${val.nomor}.docx`); // Nama file yang diunduh
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Tampilkan toast sukses
        toast({
          title: "Berhasil",
          description: "File nota dinas berhasil diunduh",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Redirect setelah download selesai
      })
      .catch((err) => {
        console.error(err); // Tangani error

        // Tampilkan toast error
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat mengunduh file",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      })
      .finally(() => {
        setLoadingSurat((prev) => ({ ...prev, [val.id]: false }));
      });
  };
  const tambahkendaraan = () => {
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/post`, {
        nomor,
        seri,
        unitKerjaId,
        pegawaiId,
        nomorMesin,
        nomorKontak,
        nomorRangka,
        kondisiId,
        statusId,
        jenisId,
      })
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };
  async function fetchSeed() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/get/seed`)
      .then((res) => {
        console.log(res.data);
        setDataSeed(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataKendaraan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan/get?time=${time}&page=${page}&limit=${limit}&unitKerjaId=${unitKerjaFilterId}&pegawaiId=${pegawaiFilterId}&nomor=${nomorPlat}&startDate=${tanggalAwal}&endDate=${tanggalAkhir}`
      )
      .then((res) => {
        setDataKendaraan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/get/download`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
          // headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-Kendaraan-dinas.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };

  function inputHandler(event, field) {
    const tes = setTimeout(() => {
      const { value } = event.target;

      setNomorPlat(value);
    }, 2000);
  }
  useEffect(() => {
    fetchDataKendaraan();
    fetchSeed();
    fetchDataPegawai();
  }, [
    page,
    unitKerjaFilterId,
    pegawaiFilterId,
    nomorPlat,
    tanggalAkhir,
    tanggalAwal,
  ]);
  return (
    <>
      <LayoutAset>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <HStack gap={5} mb={"30px"}>
              <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
                Tambah +
              </Button>{" "}
              <Spacer />
              <Button
                variant={"primary"}
                fontWeight={900}
                onClick={downloadExcel}
              >
                <BsDownload />
              </Button>{" "}
            </HStack>{" "}
            <Flex
              borderRadius={"5px"}
              bg={colorMode === "dark" ? "gray.800" : "white"}
              mb={"30px"}
              gap={5}
            >
              <FormControl>
                <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
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
                    setPegawaiFilterId(selectedOption.value);
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
                      bg: state.isFocused ? "aset" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl border={0}>
                <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                <Select2
                  options={dataSeed?.unitKerja?.map((val) => ({
                    value: val.id,
                    label: `${val.unitKerja}`,
                  }))}
                  placeholder="Contoh: Laboratorium kesehatan daerah"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setUnitKerjaFilterId(selectedOption.value);
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
              </FormControl>
              <FormControl>
                <FormLabel fontSize={"24px"}>Nomor Plat</FormLabel>
                <Input
                  height={"60px"}
                  bgColor={"terang"}
                  onChange={inputHandler}
                  placeholder="Contoh : 3321"
                />
              </FormControl>{" "}
              <FormControl>
                <FormLabel fontSize={"24px"}>Awal</FormLabel>
                <Input
                  minWidth={"200px"}
                  bgColor={"terang"}
                  height={"60px"}
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize={"24px"}> Akhir</FormLabel>
                <Input
                  type="date"
                  minWidth={"200px"}
                  bgColor={"terang"}
                  height={"60px"}
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                />
              </FormControl>
            </Flex>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>Foto</Th>
                  <Th>Nomor Plat</Th>
                  <Th>Jenis Kendaraan</Th>
                  <Th>Merek</Th>
                  <Th>Warna</Th>
                  <Th>tanggal Pajak</Th>
                  <Th>tanggal STNK</Th> <Th maxWidth={"20px"}>Unit Kerja</Th>
                  <Th>Nama Pemilik</Th>
                  <Th>nominal Pajak</Th>
                  <Th>status</Th>
                  <Th>kondisi</Th>
                  <Th>Nilai Perolehan</Th>
                  <Th>tanggal Perolehan</Th>
                  <Th>kontak</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {DataKendaraan?.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>
                      <Image
                        borderRadius={"5px"}
                        alt="foto obat"
                        width="80px"
                        height="100px"
                        overflow="hiden"
                        objectFit="cover"
                        src={
                          item?.foto
                            ? import.meta.env.VITE_REACT_APP_API_BASE_URL +
                              item?.foto
                            : Foto
                        }
                      />
                    </Td>
                    <Td>{`KT ${item?.nomor} ${item?.seri}`}</Td>
                    <Td>{item?.jenisKendaraan?.jenis}</Td>
                    <Td>{item?.merek}</Td>
                    <Td>{item?.warna}</Td>
                    <Td>
                      {item?.tgl_pkb
                        ? new Date(item?.tgl_pkb).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>
                    <Td>
                      {item?.tg_stnk
                        ? new Date(item?.tg_stnk).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>{" "}
                    <Td>{item?.kendaraanUK?.unitKerja}</Td>
                    <Td>{item?.pegawai?.nama}</Td>
                    <Td>
                      {" "}
                      Rp
                      {Number(item?.total).toLocaleString("id-ID")}
                    </Td>
                    <Td>{item?.statusKendaraan?.status}</Td>
                    <Td>{item?.kondisi?.nama}</Td>
                    <Td>
                      {" "}
                      Rp
                      {Number(item?.nilaiPerolehan).toLocaleString("id-ID")}
                    </Td>{" "}
                    <Td>
                      {" "}
                      {item?.tanggalPerolehan
                        ? new Date(item?.tanggalPerolehan).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </Td>
                    <Td>{item?.noKontak}</Td>
                    <Td>
                      <Menu
                        closeOnSelect={false}
                        isOpen={openMenuId === item.id}
                        onClose={() => setOpenMenuId(null)}
                      >
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<BsThreeDotsVertical />}
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === item.id ? null : item.id
                            )
                          }
                        />
                        <MenuList>
                          <MenuItem
                            onClick={() => cekPajak(item)}
                            isDisabled={loadingItems[item.id]}
                          >
                            {loadingItems[item.id]
                              ? "Mengecek..."
                              : "Cek Pajak"}
                          </MenuItem>

                          {item.id && (
                            <MenuItem
                              onClick={() =>
                                history.push(
                                  `/sijaka/detail-kendaraan/${item.id}`
                                )
                              }
                              icon={<BsEyeFill />}
                            >
                              Lihat Detail
                            </MenuItem>
                          )}

                          <MenuItem
                            onClick={() => cektakSurat(item)}
                            isDisabled={loadingSurat[item.id]}
                            icon={<BsFileEarmarkArrowDown />}
                          >
                            {loadingSurat[item.id]
                              ? "Mencetak..."
                              : "Cetak Surat"}
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
            </div>
          </Box>

          <Modal
            closeOnOverlayClick={false}
            isOpen={isTambahOpen}
            onClose={onTambahClose}
          >
            <ModalOverlay />
            <ModalContent borderRadius={0} maxWidth="1200px">
              <ModalHeader></ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <Box>
                  <HStack>
                    <Box
                      bgColor={"primary"}
                      width={"30px"}
                      height={"30px"}
                    ></Box>
                    <Heading color={"primary"}>Tambah Pegawai</Heading>
                  </HStack>

                  <SimpleGrid columns={2} spacing={10} p={"30px"}>
                    <FormControl
                      my={"30px"}
                      border={0}
                      bgColor={"white"}
                      flex="1"
                    >
                      <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                      <Select2
                        options={dataSeed?.unitKerja?.map((val) => ({
                          value: val.id,
                          label: `${val.unitKerja}`,
                        }))}
                        placeholder="Contoh: Laboratorium kesehatan daerah"
                        focusBorderColor="red"
                        onChange={(selectedOption) => {
                          setUnitKerjaId(selectedOption.value);
                          fetchDataPegawai(selectedOption.value);
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
                    </FormControl>

                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
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
                            console.error(
                              "Failed to load options:",
                              err.message
                            );
                            return [];
                          }
                        }}
                        placeholder="Ketik Nama Pegawai"
                        onChange={(selectedOption) => {
                          setPegawaiId(selectedOption.value);
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
                            bg: state.isFocused ? "aset" : "white",
                            color: state.isFocused ? "white" : "black",
                          }),
                        }}
                      />
                    </FormControl>
                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Nomor Kendaraan</FormLabel>
                      <Input
                        height={"60px"}
                        bgColor={"terang"}
                        onChange={(e) =>
                          handleSubmitChange("nomor", e.target.value)
                        }
                        placeholder="Contoh:1405"
                      />
                    </FormControl>
                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Seri</FormLabel>
                      <Input
                        height={"60px"}
                        bgColor={"terang"}
                        onChange={(e) =>
                          handleSubmitChange("seri", e.target.value)
                        }
                        placeholder="Contoh: E"
                      />
                    </FormControl>

                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Nomor Mesin</FormLabel>
                      <Input
                        height={"60px"}
                        bgColor={"terang"}
                        onChange={(e) =>
                          handleSubmitChange("nomorMesin", e.target.value)
                        }
                        placeholder="Contoh: E109-ID-733219"
                      />
                    </FormControl>
                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Nomor Rangka</FormLabel>
                      <Input
                        height={"60px"}
                        bgColor={"terang"}
                        onChange={(e) =>
                          handleSubmitChange("nomorRangka", e.target.value)
                        }
                        placeholder="Contoh: MH8FD110XIJ-728523"
                      />
                    </FormControl>
                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Nomor Kontak</FormLabel>
                      <Input
                        height={"60px"}
                        bgColor={"terang"}
                        onChange={(e) =>
                          handleSubmitChange("nomorKontak", e.target.value)
                        }
                        placeholder="Contoh: 628123040323321"
                      />
                    </FormControl>
                    <FormControl
                      my={"30px"}
                      border={0}
                      bgColor={"white"}
                      flex="1"
                    >
                      <FormLabel fontSize={"24px"}>Jenis Kendaraan</FormLabel>
                      <Select2
                        options={dataSeed?.jenis?.map((val) => ({
                          value: val.id,
                          label: `${val.jenis}`,
                        }))}
                        placeholder="Contoh: Roda Dua"
                        focusBorderColor="red"
                        onChange={(selectedOption) => {
                          setJenisId(selectedOption.value);
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
                    </FormControl>

                    <FormControl
                      my={"30px"}
                      border={0}
                      bgColor={"white"}
                      flex="1"
                    >
                      <FormLabel fontSize={"24px"}>Kondisi Kendaraan</FormLabel>
                      <Select2
                        options={dataSeed?.kondisi?.map((val) => ({
                          value: val.id,
                          label: `${val.nama}`,
                        }))}
                        placeholder="Contoh: Baik"
                        focusBorderColor="red"
                        onChange={(selectedOption) => {
                          setKondisiId(selectedOption.value);
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
                    </FormControl>
                    <FormControl
                      my={"30px"}
                      border={0}
                      bgColor={"white"}
                      flex="1"
                    >
                      <FormLabel fontSize={"24px"}>Status Kendaraan</FormLabel>
                      <Select2
                        options={dataSeed?.status?.map((val) => ({
                          value: val.id,
                          label: `${val.status}`,
                        }))}
                        placeholder="Contoh: Lunas"
                        focusBorderColor="red"
                        onChange={(selectedOption) => {
                          setStatusId(selectedOption.value);
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
                    </FormControl>
                  </SimpleGrid>
                </Box>
              </ModalBody>

              <ModalFooter pe={"60px"} pb={"30px"}>
                <Button onClick={tambahkendaraan} variant={"primary"}>
                  Tambah Kendaraan
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </LayoutAset>
    </>
  );
}

export default DaftarKendaraan;
