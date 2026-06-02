import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
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
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function DetailLaporan(props) {
  // Fungsi untuk memformat nomor surat dengan mengganti BULAN dan TAHUN
  const formatNomorSurat = (nomor, tanggal, nomorPesanan) => {
    if (!nomor || !tanggal) return nomor || "-";

    try {
      const date = new Date(tanggal);
      const bulanAngka = date.getMonth() + 1;
      const tahun = date.getFullYear().toString();

      // Konversi bulan ke angka romawi
      const bulanRomawi = convertToRoman(bulanAngka);

      // Ganti BULAN dan TAHUN dalam format nomor
      return nomor
        .replace(/BULAN/g, bulanRomawi)
        .replace(/TAHUN/g, tahun)
        .replace(/NOMOR/g, nomorPesanan);
    } catch (error) {
      console.error("Error formatting nomor surat:", error);
      return nomor;
    }
  };

  // Fungsi untuk mengkonversi angka ke romawi
  const convertToRoman = (num) => {
    const romanNumerals = [
      { value: 12, numeral: "XII" },
      { value: 11, numeral: "XI" },
      { value: 10, numeral: "X" },
      { value: 9, numeral: "IX" },
      { value: 8, numeral: "VIII" },
      { value: 7, numeral: "VII" },
      { value: 6, numeral: "VI" },
      { value: 5, numeral: "V" },
      { value: 4, numeral: "IV" },
      { value: 3, numeral: "III" },
      { value: 2, numeral: "II" },
      { value: 1, numeral: "I" },
    ];

    for (let i = 0; i < romanNumerals.length; i++) {
      if (num >= romanNumerals[i].value) {
        return romanNumerals[i].numeral;
      }
    }
    return "I"; // fallback untuk bulan 1
  };

  const [DataPersediaan, setDataPersediaan] = useState([]);
  const [page, setPage] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [spesifikasi, setSpesifikasi] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [harga, setHarga] = useState(0);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [persediaanId, setPersediaanId] = useState(0);
  const [nomorPesanan, setNomorPesanan] = useState(0);
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [dataSuratPesanan, setDataSuratPesanan] = useState(null);
  const [sumberDanaId, setSumberDanaId] = useState(null);
  const [suratPesananId, setSuratPesananId] = useState(null);
  const [dataSatuan, setDataSatuan] = useState(null);

  const [satuanPersediaanId, setSatuanPersediaanId] = useState(0);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(Foto);
  const [previewFotoUrl, setPreviewFotoUrl] = useState(null);

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isFotoOpen,
    onOpen: onFotoOpen,
    onClose: onFotoClose,
  } = useDisclosure();
  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "spek") {
      setSpesifikasi(val);
    } else if (field == "jumlah") {
      setJumlah(parseInt(val));
    } else if (field == "harga") {
      setHarga(parseInt(val));
    } else if (field == "tanggal") {
      setTanggal(val);
    } else if (field == "keterangan") {
      setKeterangan(val);
    } else if (field == "nomorPesanan") {
      setNomorPesanan(val);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size / 1024 > 2048) {
      toast({
        title: "Error!",
        description: "Ukuran file maksimal 2MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setSpesifikasi("");
    setJumlah(0);
    setHarga(0);
    setTanggal("");
    setKeterangan("");
    setPersediaanId(0);
    setNomorPesanan(0);
    setSumberDanaId(null);
    setSuratPesananId(null);
    setSatuanPersediaanId(0);
    setUnitKerjaId(null);
    setSelectedFile(null);
    setPreviewUrl(Foto);
  };

  async function fetchUnitKerja() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
      )
      .then((res) => {
        setDataUnitKerja(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const FILTER_ALL = "all";
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith("http")) return foto;
    return `${apiBaseUrl}${foto.startsWith("/") ? foto : `/${foto}`}`;
  };

  const renderFoto = (foto, size = "50px") => {
    const src = getFotoUrl(foto);
    if (!src) {
      return (
        <Image
          src={Foto}
          alt="no foto"
          boxSize={size}
          objectFit="cover"
          borderRadius="md"
          opacity={0.5}
        />
      );
    }

    return (
      <Image
        src={src}
        alt="foto persediaan"
        boxSize={size}
        objectFit="cover"
        borderRadius="md"
        cursor="pointer"
        onClick={() => {
          setPreviewFotoUrl(src);
          onFotoOpen();
        }}
      />
    );
  };

  const getStokMasuks = () => {
    if (!DataPersediaan?.length) return [];
    if (filterUnitKerjaId === FILTER_ALL) {
      return DataPersediaan.flatMap((item) => item?.stokMasuks || []);
    }
    return DataPersediaan[0]?.stokMasuks || [];
  };

  async function fetchPersediaanMasuk(unitKerjaIdParam) {
    const id = unitKerjaIdParam ?? filterUnitKerjaId;
    if (!id) return;

    const baseUrl = `${
      import.meta.env.VITE_REACT_APP_API_BASE_URL
    }/laporan-persediaan/get/detail/${props.match.params.id}`;
    const url =
      id === FILTER_ALL ? baseUrl : `${baseUrl}?unitKerjaId=${id}`;

    await axios
      .get(url)
      .then((res) => {
        setDataPersediaan(res.data.result);
        setDataSumberDana(res.data.resultSumberDana);
        setDataSuratPesanan(res.data.resultSuratPesanan);
        setDataSatuan(res.data.resultSatuan);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  const tambahPersediaan = () => {
    if (!unitKerjaId) {
      toast({
        title: "Error!",
        description: "Unit kerja harus dipilih",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("persediaanId", persediaanId);
    formData.append("spesifikasi", spesifikasi);
    formData.append("jumlah", jumlah);
    formData.append("harga", harga);
    formData.append("tanggal", tanggal);
    formData.append("keterangan", keterangan);
    formData.append("unitKerjaId", unitKerjaId);
    formData.append("laporanPersediaanId", props.match.params.id);
    if (suratPesananId) formData.append("suratPesananId", suratPesananId);
    if (nomorPesanan) formData.append("nomorPesanan", nomorPesanan);
    if (sumberDanaId) formData.append("sumberDanaId", sumberDanaId);
    if (satuanPersediaanId) formData.append("satuanPersediaanId", satuanPersediaanId);
    if (selectedFile) formData.append("pic", selectedFile);

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/post/masuk`,
        formData
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Stok masuk berhasil disimpan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetForm();
        onTambahClose();
        fetchPersediaanMasuk();
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

  useEffect(() => {
    fetchUnitKerja();
    const defaultUnitKerjaId = user[0]?.unitKerja_profile?.id;
    if (defaultUnitKerjaId) {
      setFilterUnitKerjaId(defaultUnitKerjaId);
    }
  }, []);

  useEffect(() => {
    if (filterUnitKerjaId) {
      fetchPersediaanMasuk(filterUnitKerjaId);
    }
  }, [page, filterUnitKerjaId]);

  const unitKerjaFilterOptions = [
    { value: FILTER_ALL, label: "Semua Unit Kerja" },
    ...(dataUnitKerja?.map((val) => ({
      value: val.id,
      label: val.unitKerja,
    })) || []),
  ];
  return (
    <>
      <LayoutAset>
        <Container
          maxW={"3280px"}
          bgColor={"secondary"}
          pb={"40px"}
          px={"30px"}
        >
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <HStack gap={5} mb={"30px"} align="flex-end">
              <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
                Tambah +
              </Button>

              <FormControl maxW="320px">
                <FormLabel fontSize="sm">Filter Unit Kerja</FormLabel>
                <Select2
                  options={unitKerjaFilterOptions}
                  placeholder="Pilih unit kerja"
                  value={
                    filterUnitKerjaId
                      ? unitKerjaFilterOptions.find(
                          (opt) => opt.value === filterUnitKerjaId
                        ) || null
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFilterUnitKerjaId(selectedOption?.value || null);
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

              <Spacer />
            </HStack>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>No.</Th>
                  <Th>Nomor Surat</Th>
                  <Th>tanggal</Th>
                  <Th>Unit Kerja</Th>
                  <Th>Sumber Dana</Th>
                  <Th>Kode barang</Th>
                  <Th maxWidth={"20px"}>Nama barang</Th> <Th>NUSP</Th>
                  <Th>spesifikasi</Th>
                  <Th>jumlah</Th>
                  <Th>Satuan</Th>
                  <Th>harga satuan</Th>
                  <Th>Total</Th>
                  <Th>Foto</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getStokMasuks().map((item, index) => (
                  <Tr key={item.id}>
                    {" "}
                    <Td>{index + 1}</Td>{" "}
                    <Td>
                      {formatNomorSurat(
                        item?.suratPesanan.nomor,
                        item?.tanggal,
                        item?.nomorPesanan
                      )}
                    </Td>
                    <Td>
                      {item?.tanggal
                        ? new Date(item?.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>
                    <Td>
                      {item?.daftarUnitKerja?.unitKerja ||
                        dataUnitKerja?.find(
                          (val) => val.id === item?.unitKerjaId
                        )?.unitKerja ||
                        "-"}
                    </Td>
                    <Td>{item?.sumberDana.sumber}</Td>
                    <Td>
                      {
                        item?.persediaan?.tipePersediaan?.rinObPersediaan
                          ?.obPersediaan?.kode
                      }
                      .{item?.persediaan?.tipePersediaan.rinObPersediaan.kode}.
                      {item?.persediaan?.tipePersediaan.kodeRekening}.
                      {item?.persediaan?.kodeBarang}
                    </Td>
                    <Td>{item?.persediaan?.nama}</Td>{" "}
                    <Td>{item?.persediaan?.NUSP || "-"}</Td>
                    <Td>{item?.spesifikasi}</Td>
                    <Td>{item?.jumlah}</Td>
                    <Td>{item?.satuanPersediaan?.satuan}</Td>
                    <Td>
                      Rp
                      {Number(item?.hargaSatuan).toLocaleString("id-ID")}
                    </Td>
                    <Td>
                      Rp
                      {Number(item?.jumlah * item?.hargaSatuan).toLocaleString(
                        "id-ID"
                      )}
                    </Td>
                    <Td>{renderFoto(item?.foto)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>

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
                  <Box bgColor={"aset"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"aset"}>Tambah Barang</Heading>
                </HStack>

                <SimpleGrid columns={2} spacing={10} p={"30px"}>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                    <Select2
                      options={dataUnitKerja?.map((val) => ({
                        value: val.id,
                        label: val.unitKerja,
                      }))}
                      placeholder="Pilih unit kerja"
                      onChange={(selectedOption) => {
                        setUnitKerjaId(selectedOption.value);
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
                    <FormLabel fontSize={"24px"}>Nama Barang</FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue) return [];
                        try {
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/persediaan/search?q=${inputValue}`
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
                      placeholder="Ketik Nama barang"
                      onChange={(selectedOption) => {
                        setPersediaanId(selectedOption.value);
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
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Spesifikasi barang</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("spek", e.target.value)
                      }
                      placeholder="Contoh: Kertas HVS 40g"
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Jumlah</FormLabel>
                    <Input
                      height={"60px"}
                      type="number"
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("jumlah", e.target.value)
                      }
                      placeholder="Contoh: 500"
                    />
                  </FormControl>
                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Satuan</FormLabel>
                    <Select2
                      options={dataSatuan?.map((val) => ({
                        value: val.id,
                        label: `${val.satuan}`,
                      }))}
                      placeholder="Contoh: Lunas"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setSatuanPersediaanId(selectedOption.value);
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
                    <FormLabel fontSize={"24px"}>harga Satuan</FormLabel>
                    <Input
                      type="number"
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("harga", e.target.value)
                      }
                      placeholder="Contoh: 5000"
                    />
                  </FormControl>{" "}
                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Sumber Dana</FormLabel>
                    <Select2
                      options={dataSumberDana?.map((val) => ({
                        value: val.id,
                        label: `${val.sumber}`,
                      }))}
                      placeholder="Contoh: Lunas"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setSumberDanaId(selectedOption.value);
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
                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Surat Pesanan</FormLabel>
                    <Select2
                      options={dataSuratPesanan?.map((val) => ({
                        value: val.id,
                        label: `${val.nomor}`,
                      }))}
                      placeholder="Contoh: Lunas"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setSuratPesananId(selectedOption.value);
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
                    <FormLabel fontSize={"24px"}>nomor Surat</FormLabel>
                    <Input
                      type="number"
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("nomorPesanan", e.target.value)
                      }
                      placeholder="Contoh: 5000"
                    />
                  </FormControl>{" "}
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>tanggal</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      max={DataPersediaan[0]?.tanggalAkhir.split("T")[0]}
                      type="date"
                      onChange={(e) =>
                        handleSubmitChange("tanggal", e.target.value)
                      }
                      placeholder="Contoh: 5000"
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>keterangan</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("keterangan", e.target.value)
                      }
                      placeholder="Contoh: Pembelian rutin"
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Foto Barang</FormLabel>
                    <Center>
                      <Image
                        src={previewUrl}
                        alt="preview"
                        boxSize="120px"
                        objectFit="cover"
                        borderRadius="md"
                        mb={3}
                      />
                    </Center>
                    <Input
                      type="file"
                      accept="image/*"
                      bgColor={"terang"}
                      onChange={handleFile}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}>
              <Button onClick={tambahPersediaan} variant={"primary"}>
                Tambah Persediaan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isFotoOpen} onClose={onFotoClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Foto Persediaan</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Center>
                <Image
                  src={previewFotoUrl || Foto}
                  alt="foto persediaan"
                  maxH="70vh"
                  objectFit="contain"
                  borderRadius="md"
                />
              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      </LayoutAset>
    </>
  );
}

export default DetailLaporan;
