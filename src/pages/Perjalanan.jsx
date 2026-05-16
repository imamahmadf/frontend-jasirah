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
  Image,
  ModalCloseButton,
  Container,
  Switch,
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
  Input,
  Heading,
  SimpleGrid,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import Layout from "../Componets/Layout";

import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../Redux/Reducers/auth";
import { Link, useHistory } from "react-router-dom";
import Loading from "../Componets/Loading";

function Perjalanan() {
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [dataPegawai, setDataPegawai] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");
  const [klasifikasi, setKlasifikasi] = useState(null);
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState(null);
  // const [inputEndDate, setInputEndDate] = useState("");
  const [dataSeed, setDataSeed] = useState([]);
  const [untuk, setUntuk] = useState("");
  const [dasar, setDasar] = useState(null);
  const [asal, setAsal] = useState(user[0]?.unitKerja_profile?.asal);
  const [dataTtdNotaDinas, setDataTtdNotaDinas] = useState(null);
  const [dataTtdSuratTugas, setDataTtdSuratTugas] = useState(null);
  const [dataPPTK, setDataPPTK] = useState(null);
  const [dataKPA, setDataKPA] = useState(null);
  const [jenisPerjalanan, setJenisPerjalanan] = useState([]);
  const history = useHistory();
  const [dataKota, setDataKota] = useState([
    { dataDalamKota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [dataSubKegiatan, setDataSubKegiatan] = useState([]);
  const [tanggalBerangkat, setTanggalBerangkat] = useState("");
  const [tanggalPulang, setTanggalPulang] = useState("");
  const [perjalananKota, setPerjalananKota] = useState([
    { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKlasifikasi, setDataKlasifikasi] = useState([]);
  const [dataKodeKlasifikasi, setDataKodeKlasifikasi] = useState(null);
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [dataBendahara, setDataBendahara] = useState(null);
  const [jenisPelayananKesehatan, setJenisPelayananKesehatan] = useState(1);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState([]);
  const [isSrikandi, setIsSrikandi] = useState(1);
  const [isNotaDinas, setIsNotaDinas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [dataTemplate, setDataTemplate] = useState([]);

  const handleChange = (e, field) => {
    //console.log(field);
    const { value } = e.target;
    if (field === "pengajuan") {
      setTanggalPengajuan(value);
    } else if (field === "berangkat") {
      setTanggalBerangkat(value);
    } else if (field === "pulang") {
      setTanggalPulang(value);
    }
  };

  async function fetchTemplate() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get/${
          user[0].unitKerja_profile.indukUnitKerja.id
        }`
      )
      .then((res) => {
        setDataTemplate(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  const submitPerjalanan = () => {
    setIsLoading(true);
    console.log(selectedPegawai);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/post/nota-dinas`,
        {
          pegawai: selectedPegawai,
          dataTtdSurTug: dataTtdSuratTugas,
          dataTtdNotaDinas,
          PPTKId: dataPPTK.value.id,
          tanggalPengajuan,
          noSurat: dataSeed?.resultDaftarNomorSurat,
          subKegiatanId: dataSubKegiatan.value.id,
          untuk,
          dasar,
          asal,
          kodeRekeningFE: `${dataSubKegiatan?.value?.kodeRekening}${jenisPerjalanan.value.kodeRekening}`,
          subKegiatan: dataSubKegiatan.value.subKegiatan,
          ttdNotDis: dataTtdNotaDinas,
          perjalananKota,
          // sumber: dataKegiatan.value.sumber,
          jenis: jenisPerjalanan.value,
          dalamKota: dataKota,
          tanggalBerangkat,
          tanggalPulang,
          indukUnitKerjaFE: user[0]?.unitKerja_profile,
          KPAId: dataKPA.value.id,
          kodeKlasifikasi: dataKodeKlasifikasi,
          dataBendaharaId: dataBendahara.id,
          pelayananKesehatanId: jenisPelayananKesehatan,
          isSrikandi,
          isNotaDinas,
        },
        {
          responseType: "blob", // Penting untuk menerima file sebagai blob
        }
      )
      .then((res) => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const fileLink = document.createElement("a");
        fileLink.href = url;
        fileLink.download = "nota_dinas.docx";
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        URL.revokeObjectURL(url); // Bersihkan blob dari memori

        toast({
          title: "Berhasil",
          description: "File nota dinas berhasil diunduh",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setTimeout(() => {
          history.push("/daftar");
        }, 1000); // delay 1 detik setelah klik
      })

      .catch((err) => {
        console.error(err); // Tangani error
        setIsLoading(false);

        // Tampilkan toast error
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat mengunduh file",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      });
  };

  async function fetchDataPegawai() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`)
      .then((res) => {
        console.log(res.status, res.data, "tessss");

        setDataPegawai(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  async function fetchSeedPerjalanan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/seed?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&unitKerjaId=${user[0]?.unitKerja_profile?.id}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        setDataSeed(res.data);

        if (res.data.resultPPTK && res.data.resultPPTK.length > 0) {
          setDataPPTK({
            value: res.data.resultPPTK[0],
            label: res.data.resultPPTK[0]?.pegawai_PPTK?.nama,
          });
        }

        if (res.data.resultKPA && res.data.resultKPA.length > 0) {
          setDataKPA({
            value: res.data.resultKPA[0],
            label: res.data.resultKPA[0]?.pegawai_KPA?.nama,
          });
        }
        if (
          res.data.resultTtdNotaDinas &&
          res.data.resultTtdNotaDinas.length > 0
        ) {
          setDataTtdNotaDinas({
            value: res.data.resultTtdNotaDinas[0],
            label: res.data.resultTtdNotaDinas[0]?.pegawai_notaDinas?.nama,
          });
        }

        if (
          res.data.resultTtdSuratTugas &&
          res.data.resultTtdSuratTugas.length > 0
        ) {
          setDataTtdSuratTugas({
            value: res.data.resultTtdSuratTugas[0],
            label: res.data.resultTtdSuratTugas[0]?.pegawai?.nama,
          });
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  const fetchJenisPerjalanan = async (id) => {
    console.log(id, "data sumber dana");
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/jenis-perjalanan/${id}`
      )
      .then((res) => {
        console.log(res.data, "tessss");
        setDataJenisPerjalanan(res.data.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const fetchDataKodeKlasifikasi = async (id) => {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/klasifikasi/get/kode-klasifikasi/${id}`
      )
      .then((res) => {
        console.log(res.data, "tessss");
        setKodeKlasifikasi(res.data.result);
        setDataKlasifikasi(res.data.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  useEffect(() => {
    fetchDataPegawai();
    fetchSeedPerjalanan();
    fetchTemplate();
  }, []);

  const handleSelectChange = (selectedOption, pegawaiIndex) => {
    if (selectedOption) {
      const newPegawaiList = [...selectedPegawai];
      newPegawaiList[pegawaiIndex] = selectedOption; // Simpan pegawai yang dipilih
      setSelectedPegawai(newPegawaiList);
    }
    console.log(selectedPegawai);
  };

  const handlePerjalananChange = (index, field, value) => {
    const newPerjalanan = [...perjalananKota];
    newPerjalanan[index][field] = value;
    setPerjalananKota(newPerjalanan);
  };

  const handleDalamKotaChange = (index, field, value) => {
    const newDalamKota = [...dataKota];
    newDalamKota[index][field] = value;
    setDataKota(newDalamKota);
  };

  const addPerjalanan = () => {
    setPerjalananKota([
      ...perjalananKota,
      { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const addDataKota = () => {
    setDataKota([
      ...dataKota,
      { dataDalamKota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  return (
    <Layout>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {dataTemplate.templateNotaDinas ? (
            <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
              <Container
                maxW={"1280px"}
                variant={"primary"}
                pt={"30px"}
                ps={"0px"}
              >
                <HStack>
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"}>Data Nota Dinas</Heading>
                </HStack>
                <Box p={"30px"}>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Klasifikasi</FormLabel>
                    <Select2
                      options={dataSeed.resultKlasifikasi?.map((val) => {
                        return {
                          value: val,
                          label: `${val.kode}-${val.namaKlasifikasi}`,
                        };
                      })}
                      placeholder="Cari Klasifikasi"
                      onChange={(selectedOption) => {
                        setKlasifikasi(selectedOption);
                        fetchDataKodeKlasifikasi(selectedOption.value.id);
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

                  {dataKlasifikasi[0] ? (
                    <FormControl my={"30px"}>
                      <FormLabel fontSize={"24px"}>Kode Klasifikasi</FormLabel>
                      <Select2
                        options={dataKlasifikasi.map((val) => ({
                          value: val,
                          label: `${val.kode} - ${val.kegiatan}`,
                        }))}
                        placeholder="Pilih Klasifikasi"
                        focusBorderColor="red"
                        onChange={(selectedOption) => {
                          setDataKodeKlasifikasi(selectedOption);
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
                  ) : null}
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Untuk</FormLabel>
                    <Textarea
                      onChange={(e) => {
                        setUntuk(e.target.value);
                      }}
                      placeholder="isi dengan tujuan perjalanan dinas"
                      backgroundColor={"terang"}
                      p={"20px"}
                      minHeight={"160px"}
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Dasar</FormLabel>
                    <Textarea
                      onChange={(e) => {
                        setDasar(e.target.value);
                      }}
                      placeholder="isi dengan telaah staff atau undangan"
                      backgroundColor={"terang"}
                      p={"20px"}
                      minHeight={"160px"}
                    />
                  </FormControl>
                  <Flex gap={4}>
                    <Checkbox
                      isChecked={isSrikandi === 1}
                      onChange={(e) => setIsSrikandi(e.target.checked ? 1 : 0)}
                    >
                      Srikandi
                    </Checkbox>
                    <Checkbox
                      isChecked={isNotaDinas === 1}
                      onChange={(e) => setIsNotaDinas(e.target.checked ? 1 : 0)}
                    >
                      Nota Dinas
                    </Checkbox>
                  </Flex>
                </Box>
              </Container>
              <Container
                maxW={"1280px"}
                variant={"primary"}
                pt={"30px"}
                ps={"0px"}
                my={"30px"}
              >
                <HStack>
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"}>Daftar Personil</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4} p={"30px"}>
                  <FormControl my={"15px"}>
                    <FormLabel fontSize={"24px"}>Personil 1</FormLabel>
                    <Select2
                      options={dataPegawai.result
                        ?.filter((val) => val.profesiId !== 1)
                        .map((val) => ({
                          value: val,
                          label: `${val.nama}`,
                        }))}
                      placeholder="Cari Nama Pegawai"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, 0);
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
                  <FormControl my={"15px"}>
                    <FormLabel fontSize={"24px"}>Personil 2</FormLabel>
                    <Select2
                      options={dataPegawai.result
                        ?.filter((val) => val.profesiId !== 1)
                        .map((val) => ({
                          value: val,
                          label: `${val.nama}`,
                        }))}
                      placeholder="Cari Nama Pegawai"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, 1);
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
                    <FormLabel fontSize={"24px"}>Personil 3</FormLabel>
                    <Select2
                      options={dataPegawai.result
                        ?.filter((val) => val.profesiId !== 1)
                        .map((val) => ({
                          value: val,
                          label: `${val.nama}`,
                        }))}
                      placeholder="Cari Nama Pegawai"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, 2);
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
                    <FormLabel fontSize={"24px"}>Personil 4</FormLabel>
                    <Select2
                      options={dataPegawai.result
                        ?.filter((val) => val.profesiId !== 1)
                        .map((val) => ({
                          value: val,
                          label: `${val.nama}`,
                        }))}
                      placeholder="Cari Nama Pegawai"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, 3);
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
                  <FormControl my={"15px"}>
                    <FormLabel fontSize={"24px"}>Personil 5</FormLabel>
                    <Select2
                      options={dataPegawai.result
                        ?.filter((val) => val.profesiId !== 1)
                        .map((val) => ({
                          value: val,
                          label: `${val.nama}`,
                        }))}
                      placeholder="Cari Nama Pegawai"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, 4);
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
                </SimpleGrid>
              </Container>
              <Container
                maxW={"1280px"}
                variant={"primary"}
                pt={"30px"}
                ps={"0px"}
              >
                <HStack>
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"}>Daftar Tanda Tangan</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4} p={"30px"}>
                  <FormControl border={0} flex="1" my={"15px"}>
                    <FormLabel fontSize={"24px"}>
                      Tanda Tangan Nota Dinas/Telahaan Staf
                    </FormLabel>
                    <Select2
                      options={
                        dataSeed?.resultTtdNotaDinas?.map((val) => {
                          return {
                            value: val,
                            label: `${val?.pegawai_notaDinas?.nama}`,
                          };
                        }) || []
                      }
                      placeholder="Ttd Nota Dinas"
                      focusBorderColor="red"
                      value={dataTtdNotaDinas}
                      onChange={(selectedOption) => {
                        setDataTtdNotaDinas(selectedOption);
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
                  <FormControl border={0} flex="1" my={"15px"}>
                    <FormLabel fontSize={"24px"}>
                      Tanda tangan Surat Tugas
                    </FormLabel>
                    <Select2
                      options={(() => {
                        // Dapatkan semua indukUnitKerjaId unik
                        const uniqueIndukUnitKerjaIds = [
                          ...new Set(
                            dataSeed?.resultTtdSuratTugas?.map(
                              (item) => item.indukUnitKerjaId
                            ) || []
                          ),
                        ];

                        // Filter dan buat options berdasarkan indukUnitKerjaId unik
                        return uniqueIndukUnitKerjaIds.map((id) => ({
                          label:
                            id === 1
                              ? "Dinas Kesehatan"
                              : id ===
                                user[0]?.unitKerja_profile.indukUnitKerja.id
                              ? user[0]?.unitKerja_profile.indukUnitKerja
                                  .indukUnitKerja
                              : `Unit Kerja ${id}`,
                          options:
                            dataSeed?.resultTtdSuratTugas
                              ?.filter((val) => val.indukUnitKerjaId === id)
                              .map((val) => ({
                                value: val,
                                label: `${val?.pegawai?.nama} (${val.jabatan})`,
                              })) || [],
                        }));
                      })()}
                      placeholder="Ttd Surat Tugas"
                      focusBorderColor="red"
                      value={dataTtdSuratTugas}
                      onChange={(selectedOption) => {
                        setDataTtdSuratTugas(selectedOption);
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
                  <FormControl border={0} flex="1" my={"15px"}>
                    <FormLabel fontSize={"24px"}>
                      Tanda Tangan Pengguna Anggaran
                    </FormLabel>
                    <Select2
                      options={
                        dataSeed?.resultKPA?.map((val) => {
                          return {
                            value: val,
                            label: `${val?.pegawai_KPA?.nama}`,
                          };
                        }) || []
                      }
                      placeholder="Kuasa Pengguna Anggaran"
                      focusBorderColor="red"
                      value={dataKPA}
                      onChange={(selectedOption) => {
                        setDataKPA(selectedOption);
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

                  <FormControl border={0} flex="1" my={"15px"}>
                    <FormLabel fontSize={"24px"}>Tanda Tangan PPTK</FormLabel>
                    <Select2
                      options={
                        dataSeed?.resultPPTK?.map((val) => {
                          return {
                            value: val,
                            label: `${val?.pegawai_PPTK?.nama}`,
                          };
                        }) || []
                      }
                      placeholder="PPTK"
                      focusBorderColor="red"
                      value={dataPPTK}
                      onChange={(selectedOption) => {
                        setDataPPTK(selectedOption);
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
                </SimpleGrid>
              </Container>
              <Container
                maxW={"1280px"}
                variant={"primary"}
                pt={"30px"}
                ps={"0px"}
                mt={"30px"}
              >
                <HStack>
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"}>Data Keuangan</Heading>
                </HStack>
                <Box p={"30px"}>
                  <FormControl my={"15px"}>
                    <FormLabel fontSize={"24px"}>Sumber Dana</FormLabel>
                    <Select2
                      options={dataSeed?.resultSumberDana?.map((val) => {
                        return {
                          value: val,
                          label: `${val.sumber}`,
                        };
                      })}
                      placeholder="sumber dana"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setDataSumberDana(selectedOption);
                        fetchJenisPerjalanan(selectedOption.value.id);
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

                  {dataSumberDana?.value && (
                    <>
                      <FormControl border={0} bgColor={"white"} flex="1">
                        <Select2
                          options={dataSumberDana?.value?.bendaharas.map(
                            (val) => {
                              return {
                                value: val,
                                label: `${val.jabatan} - ${val.pegawai_bendahara.nama}`,
                              };
                            }
                          )}
                          placeholder="Cari Bendahara"
                          focusBorderColor="red"
                          onChange={(selectedOption) => {
                            setDataBendahara(selectedOption.value);
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
                    </>
                  )}
                </Box>
              </Container>
              {dataSumberDana ? (
                <>
                  <Container
                    variant={"primary"}
                    maxW={"1280px"}
                    pt={"30px"}
                    ps={"0px"}
                    my={"30px"}
                  >
                    <HStack>
                      <Box
                        bgColor={"primary"}
                        width={"30px"}
                        height={"30px"}
                      ></Box>
                      <Heading color={"primary"}>Data Perjalanan Dinas</Heading>
                    </HStack>
                    {/* {JSON.stringify(jenisPelayananKesehatan)} */}

                    <Box p={"30px"}>
                      <FormControl my={"15px"}>
                        <FormLabel fontSize={"24px"}>
                          Jenis Perjalanan
                        </FormLabel>
                        <Select2
                          options={dataJenisPerjalanan?.map((val) => {
                            return {
                              value: val,
                              label: `${val.jenis}`,
                            };
                          })}
                          placeholder="Jenis Perjalanan"
                          focusBorderColor="red"
                          onChange={(selectedOption) => {
                            setJenisPerjalanan(selectedOption);
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
                      {jenisPerjalanan?.value?.jenis?.includes("Pelayanan") ? (
                        <FormControl my={"30px"}>
                          <FormLabel fontSize={"24px"}>
                            Jenis Pelayanan Kesehatan
                          </FormLabel>
                          <Select2
                            options={dataSeed.resultPelayananKesehatan.map(
                              (val) => {
                                return {
                                  value: val.id,
                                  label: `${val.jenis}`,
                                };
                              }
                            )}
                            placeholder="Jenis Perjalanan"
                            focusBorderColor="red"
                            onChange={(selectedOption) => {
                              setJenisPelayananKesehatan(selectedOption.value);
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
                      ) : null}

                      {jenisPerjalanan?.value?.tipePerjalananId === 2 ? (
                        <Flex my={"30px"} gap={4} direction="column">
                          {perjalananKota.map((item, index) => (
                            <Flex key={index} gap={4}>
                              <FormControl>
                                <FormLabel fontSize={"24px"}>
                                  Nama Kota
                                </FormLabel>
                                <Input
                                  height={"60px"}
                                  bgColor={"terang"}
                                  value={item.kota}
                                  onChange={(e) =>
                                    handlePerjalananChange(
                                      index,
                                      "kota",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Masukkan Kota"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize={"24px"}>
                                  Tanggal Berangkat
                                </FormLabel>
                                <Input
                                  height={"60px"}
                                  bgColor={"terang"}
                                  type="date"
                                  defaultValue={item.tanggalBerangkat}
                                  onChange={(e) =>
                                    handlePerjalananChange(
                                      index,
                                      "tanggalBerangkat",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize={"24px"}>
                                  Tanggal Berangkat
                                </FormLabel>
                                <Input
                                  height={"60px"}
                                  bgColor={"terang"}
                                  type="date"
                                  defaultValue={item.tanggalPulang}
                                  onChange={(e) =>
                                    handlePerjalananChange(
                                      index,
                                      "tanggalPulang",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>
                            </Flex>
                          ))}
                          <Button
                            p={"25px"}
                            mt={"15px"}
                            variant={"secondary"}
                            onClick={addPerjalanan}
                          >
                            Tambah Kota
                          </Button>
                        </Flex>
                      ) : jenisPerjalanan?.value?.tipePerjalananId === 1 ? (
                        <Box>
                          {dataKota.map((item, index) => {
                            return (
                              <Flex key={index} gap={4}>
                                <FormControl border={0} bgColor={"white"}>
                                  <FormLabel fontSize={"24px"}>
                                    Tujuan
                                  </FormLabel>
                                  <Select2
                                    options={dataSeed?.resultDalamKota?.map(
                                      (val) => {
                                        return {
                                          value: { id: val.id, nama: val.nama },
                                          label: `${val.nama}`,
                                        };
                                      }
                                    )}
                                    placeholder="Pilih Tujuan"
                                    focusBorderColor="red"
                                    value={
                                      item.dataDalamKota
                                        ? {
                                            value: item.dataDalamKota,
                                            label:
                                              dataSeed.resultDalamKota.find(
                                                (val) =>
                                                  val.id ===
                                                  item.dataDalamKota.id
                                              )?.nama,
                                          }
                                        : null
                                    }
                                    onChange={(selectedOption) =>
                                      handleDalamKotaChange(
                                        index,
                                        "dataDalamKota",
                                        selectedOption.value
                                      )
                                    }
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
                                        bg: state.isFocused
                                          ? "primary"
                                          : "white",
                                        color: state.isFocused
                                          ? "white"
                                          : "black",
                                      }),
                                    }}
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize={"24px"}>
                                    Tanggal berangkat
                                  </FormLabel>
                                  <Input
                                    height={"60px"}
                                    bgColor={"terang"}
                                    type="date"
                                    defaultValue={item.tanggalBerangkat}
                                    onChange={(e) =>
                                      handleDalamKotaChange(
                                        index,
                                        "tanggalBerangkat",
                                        e.target.value
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize={"24px"}>
                                    Tanggal Pulang
                                  </FormLabel>
                                  <Input
                                    height={"60px"}
                                    bgColor={"terang"}
                                    type="date"
                                    defaultValue={item.tanggalPulang}
                                    onChange={(e) =>
                                      handleDalamKotaChange(
                                        index,
                                        "tanggalPulang",
                                        e.target.value
                                      )
                                    }
                                  />
                                </FormControl>
                              </Flex>
                            );
                          })}

                          {dataKota.length > 2 ? null : (
                            <Button
                              p={"25px"}
                              mt={"15px"}
                              variant={"secondary"}
                              onClick={addDataKota}
                            >
                              Tambah Kota
                            </Button>
                          )}
                        </Box>
                      ) : null}

                      <FormControl my={"30px"}>
                        <FormLabel fontSize={"24px"}> Sub Kegiatan</FormLabel>
                        <Select2
                          options={dataSeed?.resultDaftarSubKegiatan?.map(
                            (val) => {
                              return {
                                value: val,
                                label: `${val.subKegiatan} - ${val.kodeRekening}`,
                              };
                            }
                          )}
                          placeholder="Cari Kegiatan"
                          focusBorderColor="red"
                          onChange={(selectedOption) => {
                            setDataSubKegiatan(selectedOption);
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
                      {/* {JSON.stringify(dataKota)} */}
                      {dataKegiatan?.value && (
                        <>
                          <FormControl my={"30px"}>
                            <FormLabel fontSize={"24px"}>
                              Sub Kegiatan
                            </FormLabel>
                            <Select2
                              options={dataKegiatan?.value?.subKegiatan.map(
                                (val) => {
                                  return {
                                    value: val,
                                    label: `${val.subKegiatan} - ${val.kodeRekening}`,
                                  };
                                }
                              )}
                              placeholder="Cari Sub Kegiatan"
                              focusBorderColor="red"
                              onChange={(selectedOption) => {
                                setDataSubKegiatan(selectedOption);
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
                        </>
                      )}
                      {dataSubKegiatan.value ? (
                        <Text>{`Kode Rekening: ${dataSubKegiatan?.value?.kodeRekening}${jenisPerjalanan?.value?.kodeRekening}`}</Text>
                      ) : null}

                      <Flex mt={"40px"} gap={4}>
                        <FormControl>
                          <FormLabel fontSize={"24px"}>
                            Tanggal Pengajuan
                          </FormLabel>
                          <Input
                            defaultValue={tanggalPengajuan}
                            type="date"
                            height={"60px"}
                            variant={"primary"}
                            onChange={(e) => handleChange(e, "pengajuan")}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize={"24px"}>Asal</FormLabel>
                          <Input
                            onChange={(e) => {
                              setAsal(e.target.value);
                            }}
                            defaultValue={asal}
                            height={"60px"}
                            variant={"primary"}
                          />
                        </FormControl>
                      </Flex>
                    </Box>
                  </Container>
                </>
              ) : null}
              {selectedPegawai.length > 0 && (
                <Container
                  variant={"primary"}
                  maxW={"1280px"}
                  pt={"30px"}
                  ps={"0px"}
                  my={"20px"}
                >
                  <HStack>
                    <Box
                      bgColor={"primary"}
                      width={"30px"}
                      height={"30px"}
                    ></Box>
                    <Heading color={"primary"}>Data Personil</Heading>
                  </HStack>
                  <Box p={"30px"} style={{ overflowX: "auto" }}>
                    {selectedPegawai.length > 0 && (
                      <>
                        <Table variant="primary" mt={4}>
                          <Thead>
                            <Tr>
                              <Th>No</Th>
                              <Th>Nama</Th>
                              <Th>Pangkat/Golongan</Th>
                              <Th>Tingkatan</Th>
                              <Th>Jabatan</Th>
                              <Th>NIP</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedPegawai.map((pegawai, index) => (
                              <Tr key={index}>
                                <Td>{pegawai.value.id}</Td>
                                <Td>{pegawai.value.nama}</Td>
                                <Td>
                                  {pegawai.value.daftarPangkat.pangkat}/
                                  {pegawai.value.daftarGolongan.golongan}
                                </Td>
                                <Td>
                                  {pegawai.value.daftarTingkatan.tingkatan}
                                </Td>
                                <Td>{pegawai.value.jabatan}</Td>
                                <Td>{pegawai.value.nip}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </Box>
                </Container>
              )}

              <Container maxW={"1280px"} variant={"primary"} p={0}>
                <Button
                  variant={"primary"}
                  onClick={submitPerjalanan}
                  isLoading={isLoading}
                  loadingText="Mengunduh..."
                  width="100%"
                  height="60px"
                >
                  Submit
                </Button>
              </Container>
            </Box>
          ) : (
            <>
              <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
                <Container variant={"primary"} maxW={"1280px"} p={"30px"}>
                  <Center minH={"80vh"}>
                    <Button
                      onClick={() => {
                        history.push("/admin/template");
                      }}
                      variant={"primary"}
                    >
                      Upload Template Surat
                    </Button>
                  </Center>
                </Container>
              </Box>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

export default Perjalanan;
