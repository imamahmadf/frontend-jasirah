import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
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
  FormLabel,
  FormControl,
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
  HStack,
  Spacer,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { BsDownload } from "react-icons/bs";
function suratKeluarAdmin() {
  const [dataSuratKeluar, setDataSuratKeluar] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [time, setTime] = useState("");
  const [klasifikasi, setKlasifikasi] = useState(null);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [dataKlasifikasi, setDataKlasifikasi] = useState([]);
  const [dataKodeKlasifikasi, setDataKodeKlasifikasi] = useState(null);
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState(null);
  const [tujuan, setTujuan] = useState("");
  const [perihal, setPerihal] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSurat, setSelectedSurat] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [pegawaiId, setPegawaiId] = useState(null);
  const toast = useToast();

  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin/get/surat-keluar/download?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-surat-keluar.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil",
        description: "File Excel berhasil diunduh",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      toast({
        title: "Error",
        description: "Gagal mengunduh file Excel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "tujuan") {
      setTujuan(val);
    } else if (field == "perihal") {
      setPerihal(val);
    } else if (field == "tanggalSurat") {
      setTanggalSurat(val);
    } else if (field == "nomorSurat") {
      setNomorSurat(val);
      // Reset klasifikasi jika nomor surat diisi
      if (val && val.trim() !== "") {
        setDataKodeKlasifikasi(null);
        setKlasifikasi(null);
        setKodeKlasifikasi(null);
        setDataKlasifikasi([]);
      }
    }
  };
  const resetForm = () => {
    setDataKodeKlasifikasi(null);
    setKlasifikasi(null); // Reset klasifikasi utama
    setKodeKlasifikasi(null); // Reset kode klasifikasi
    setSelectedUnitKerja(null); // Reset unit kerja
    setTujuan(""); // Reset tujuan
    setPerihal(""); // Reset perihal
    setTanggalSurat(""); // Reset tanggal surat
    setNomorSurat(""); // Reset nomor surat
    setPegawaiId(null); // Reset pegawai ID
    // Jika perlu, fetch kembali data klasifikasi awal
    fetchKlasifikasi();
  };
  const submitSuratKeluar = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin/post/surat-keluar`,
        {
          unitKerja: selectedUnitKerja,
          dataKodeKlasifikasi,
          perihal,
          tujuan,
          tanggalSurat,
          nomorSurat: nomorSurat || null,
          indukUnitKerja: user[0]?.unitKerja_profile?.indukUnitKerja,
          pegawaiId: pegawaiId || null,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataSuratKeluar();
        resetForm();
        onTambahClose();
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  };

  const hapusSurat = (e) => {
    console.log(e);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin/delete/surat-keluar/${e}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        fetchDataSuratKeluar();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };
  async function fetchKlasifikasi() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/klasifikasi/get`)
      .then((res) => {
        setKlasifikasi(res.data.result);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataSuratKeluar() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin/get/surat-keluar?&time=${time}&page=${page}&limit=${limit}&indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}`
      )
      .then((res) => {
        setDataSuratKeluar(res.data.result);
        setDataUnitKerja(res.data.resultUnitKerja);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

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
    fetchDataSuratKeluar();
    fetchKlasifikasi();
  }, [page]);
  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"2880px"} variant={"primary"} pt={"30px"} ps={"0px"}>
          {JSON.stringify(user)}
          <Flex gap={4} p={"30px"}>
            <FormControl>
              <FormLabel>Tanggal Awal</FormLabel>
              <Input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Tanggal Akhir</FormLabel>
              <Input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
              />
            </FormControl>
          </Flex>{" "}
          <Flex gap={4} ms={"30px"} mb={4} align="center">
            <Button onClick={onTambahOpen} variant={"primary"}>
              Tambah +
            </Button>
            <Button
              variant={"primary"}
              fontWeight={900}
              onClick={downloadExcel}
              leftIcon={<Icon as={BsDownload} />}
            >
              Download Excel
            </Button>
            <Text fontSize="sm" color="gray.600">
              Total: {rows} data
            </Text>
          </Flex>{" "}
          <Box p={"30px"}>
            <Table variant="primary">
              <Thead>
                <Tr>
                  <Th>no.</Th>
                  <Th>Nomor Surat</Th> <Th>Jenis Surat</Th>
                  <Th>Nama Pegawai</Th>
                  <Th>Tujuan</Th>
                  <Th>Perihal</Th>
                  <Th>Tanggal</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataSuratKeluar?.map((item, index) => {
                  return (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{item.nomor}</Td>
                      <Td>
                        {!item.perjalanans[0]
                          ? "Surat keluar"
                          : item.perjalanans[0].isNotaDinas === 0
                          ? "Telaahan Staff"
                          : "Nota Dinas"}
                      </Td>
                      <Td>{item.pegawai?.nama || "-"}</Td>
                      <Td>{item.tujuan}</Td> <Td>{item.perihal}</Td>
                      <Td>
                        {item.tanggalSurat
                          ? new Date(item.tanggalSurat).toLocaleDateString(
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
                      <Td>
                        {item.perjalanans[0] ? null : (
                          <Button
                            variant={"cancle"}
                            onClick={() => {
                              setSelectedSurat(item.id);
                              onOpen();
                            }}
                          >
                            hapus
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
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
              <HStack>
                <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                <Heading color={"primary"}>Tambah Surat Keluar</Heading>
              </HStack>
              <Box p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Klasifikasi</FormLabel>
                  <Select2
                    options={klasifikasi?.map((val) => {
                      return {
                        value: val,
                        label: `${val.kode}-${val.namaKlasifikasi}`,
                      };
                    })}
                    placeholder="Cari Nama Pegawai"
                    focusBorderColor="red"
                    isDisabled={nomorSurat && nomorSurat.trim() !== ""}
                    onChange={(selectedOption) => {
                      //   setKlasifikasi(selectedOption);
                      fetchDataKodeKlasifikasi(selectedOption.value.id);
                      // Reset nomor surat jika klasifikasi dipilih
                      if (selectedOption && selectedOption.value) {
                        setNomorSurat("");
                      }
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
                        value: val.kode,
                        label: `${val.kode} - ${val.kegiatan}`,
                      }))}
                      placeholder="Pilih kode Klasifikasi"
                      focusBorderColor="red"
                      isDisabled={nomorSurat && nomorSurat.trim() !== ""}
                      onChange={(selectedOption) => {
                        setDataKodeKlasifikasi(selectedOption.value);
                        // Reset nomor surat jika kode klasifikasi dipilih
                        if (selectedOption && selectedOption.value) {
                          setNomorSurat("");
                        }
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
                <FormControl border={0} bgColor={"white"} flex="1">
                  <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                  <Select2
                    options={dataUnitKerja?.map((val) => ({
                      value: val,
                      label: `${val.kode}`,
                    }))}
                    placeholder="Pilih Klasifikasi"
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setSelectedUnitKerja(selectedOption.value);
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
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tujuan</FormLabel>
                  <Input
                    value={tujuan}
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("tujuan", e.target.value)
                    }
                    placeholder="Tujuan Surat"
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Perihal</FormLabel>
                  <Input
                    value={perihal}
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("perihal", e.target.value)
                    }
                    placeholder="Perihal"
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tanggal Surat</FormLabel>
                  <Input
                    value={tanggalSurat}
                    type="date"
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("tanggalSurat", e.target.value)
                    }
                    placeholder="Perihal"
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>
                    Nomor Surat (Opsional)
                  </FormLabel>
                  <Input
                    value={nomorSurat}
                    height={"60px"}
                    bgColor={"terang"}
                    isDisabled={
                      (dataKodeKlasifikasi !== null &&
                        dataKodeKlasifikasi !== undefined) ||
                      (dataKlasifikasi && dataKlasifikasi.length > 0)
                    }
                    onChange={(e) =>
                      handleSubmitChange("nomorSurat", e.target.value)
                    }
                    placeholder="Masukkan nomor surat manual (opsional)"
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
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Pegawai"
                    onChange={(selectedOption) => {
                      setPegawaiId(selectedOption?.value || null);
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
              </Box>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}>
              <Button
                mt={"30px"}
                variant={"primary"}
                onClick={() => {
                  submitSuratKeluar();
                }}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>{" "}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Konfirmasi Hapus</ModalHeader>
            <ModalCloseButton />

            <ModalBody>Apakah Anda yakin ingin menghapus data ini?</ModalBody>
            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={() => hapusSurat(selectedSurat)}
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
    </Layout>
  );
}

export default suratKeluarAdmin;
