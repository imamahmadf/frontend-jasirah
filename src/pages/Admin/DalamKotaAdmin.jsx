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
  Select,
  Flex,
  Textarea,
  Input,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { BsPencilFill } from "react-icons/bs";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Loading from "../../Componets/Loading";
function DalamKotaAdmin() {
  const [dataDalamKota, setDataDalamKota] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [time, setTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dataIndukUnitKerja, setDataIndukUnitKerja] = useState(null);
  const [selectedIndukUnitKerja, setSelectedIndukUnitKerja] = useState(null);
  const [namaTujuan, setNamaTujuan] = useState("");
  const [uangTransport, setUangTransport] = useState(0);
  const [durasi, setDurasi] = useState(0);
  const [indukUnitKerjaId, setIndukUnitKerjaId] = useState(0);
  const [filterIndukUnitKerjaId, setFilterIndukUnitKerjaId] = useState(0);
  const [filterTujuan, setFilterTujuan] = useState("");
  const [filterUangTransport, setFilterUangTransport] = useState("");
  const [filterDurasi, setFilterDurasi] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const [formData, setFormData] = useState({
    nama: "",
    uangTransport: "",
    durasi: "",
    indukUnitKerja: "",
  });

  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "namaTujuan") {
      setNamaTujuan(val);
    } else if (field == "uangTransport") {
      setUangTransport(val);
    } else if (field == "durasi") {
      setDurasi(val);
    }
  };

  const handleSubmitFilterChange = (field, val) => {
    const tes = setTimeout(() => {
      if (field == "tujuan") {
        setFilterTujuan(val);
      } else if (field == "uangTransport") {
        setFilterUangTransport(val);
      } else if (field == "durasi") {
        setFilterDurasi(val);
      }
    }, 2000);
  };

  const tambahTujuan = () => {
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/tujuan/post/`, {
        nama: namaTujuan,
        durasi,
        uangTransport,
        indukUnitKerjaId,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  async function fetchDalamKota() {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/tujuan/get/dalam-kota?&time=${time}&page=${page}&limit=${limit}&uangTransport=${filterUangTransport}&durasi=${filterDurasi}&nama=${filterTujuan}&indukUnitKerjaId=${filterIndukUnitKerjaId}`
      )
      .then((res) => {
        console.log(res.data, "DATASEEED");
        setDataDalamKota(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDalamKota();
    fetchIndukUnitKerja();
  }, [
    page,
    filterDurasi,
    filterIndukUnitKerjaId,
    filterTujuan,
    filterUangTransport,
  ]);

  const handleEdit = (data) => {
    setSelectedData(data);
    setFormData({
      nama: data.nama,
      uangTransport: data.uangTransport,
      durasi: data.durasi,
      indukUnitKerja: data.indukUnitKerja.indukUnitkerja,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedData(null);
  };

  async function fetchIndukUnitKerja() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/tujuan/get/seed`)
      .then((res) => {
        console.log(res.data);
        setDataIndukUnitKerja(res.data.result);
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  }

  const handleSave = async () => {
    console.log(formData);

    await axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/tujuan/edit`, {
        formData,
        id: selectedData.id,
      })
      .then((res) => {
        console.log(res.data);
        setIsOpen(false);
        setSelectedData(null);
        fetchDalamKota();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Layout>
      {isLoading ? (
        <Loading />
      ) : (
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container maxW={"1280px"} variant={"primary"} pt={"30px"} px={"0px"}>
            <Button ms={"30px"} onClick={onTambahOpen} variant={"primary"}>
              Tambah +
            </Button>
            <Box p={"30px"}>
              {/* {JSON.stringify(dataDalamKota)} */}
              <Table variant={"primary"}>
                <Thead>
                  <Tr>
                    <Th width={"320px"}>
                      Asal
                      <Box mt={"5px"} width={"320px"}>
                        <FormControl width={"320px"}>
                          <Select2
                            options={dataIndukUnitKerja?.map((val) => ({
                              value: val.id,
                              label: `${val.indukUnitKerja}`,
                            }))}
                            placeholder="Pilih Induk Unit Kerja"
                            focusBorderColor="red"
                            onChange={(selectedOption) => {
                              setFilterIndukUnitKerjaId(selectedOption.value);
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
                                width: "320px",
                                height: "30px",
                                color: "gelap",
                                _hover: {
                                  borderColor: "yellow.700",
                                },
                                minHeight: "30px",
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
                    </Th>
                    <Th>
                      Tujuan
                      <Box>
                        <FormControl mt={"5px"}>
                          <Input
                            onChange={(e) =>
                              handleSubmitFilterChange("tujuan", e.target.value)
                            }
                            type="name"
                            color={"gelap"}
                            borderRadius="5px"
                            h={"30px"}
                            bgColor={"secondary"}
                          />
                        </FormControl>
                      </Box>
                    </Th>
                    <Th>
                      Uang transport
                      <Box>
                        <FormControl mt={"5px"}>
                          <Input
                            onChange={(e) =>
                              handleSubmitFilterChange(
                                "uangTransport",
                                e.target.value
                              )
                            }
                            type="number"
                            color={"gelap"}
                            borderRadius="5px"
                            h={"30px"}
                            bgColor={"secondary"}
                          />
                        </FormControl>
                      </Box>
                    </Th>
                    <Th>
                      Durasi
                      <Box>
                        <FormControl mt={"5px"}>
                          <Input
                            onChange={(e) =>
                              handleSubmitFilterChange("durasi", e.target.value)
                            }
                            type="number"
                            color={"gelap"}
                            borderRadius="5px"
                            h={"30px"}
                            bgColor={"secondary"}
                          />
                        </FormControl>
                      </Box>
                    </Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataDalamKota.map((item, index) => {
                    return (
                      <Tr key={index}>
                        <Td>{item?.indukUnitKerja.indukUnitkerja}</Td>
                        <Td>{item.nama}</Td>
                        <Td>
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.uangTransport)}
                        </Td>
                        <Td>{item.durasi} jam</Td>

                        <Td>
                          <Button
                            p={"0px"}
                            fontSize={"14px"}
                            variant={"secondary"}
                            onClick={() => handleEdit(item)}
                          >
                            <BsPencilFill />
                          </Button>
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
            <Modal isOpen={isOpen} onClose={handleClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Edit Data Dalam Kota</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Tujuan</FormLabel>
                    <Input
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Uang Transport</FormLabel>
                    <Input
                      type="number"
                      value={formData.uangTransport}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uangTransport: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Durasi</FormLabel>
                    <Input
                      type="number"
                      value={formData.durasi}
                      onChange={(e) =>
                        setFormData({ ...formData, durasi: e.target.value })
                      }
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button variant={"primary"} mr={3} onClick={handleSave}>
                    Simpan
                  </Button>
                  <Button variant={"cancle"} onClick={handleClose}>
                    Batal
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Container>
        </Box>
      )}

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
              <Heading color={"primary"}>Tambah Tujuan</Heading>
            </HStack>
            <Box p={"30px"}>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Nama Tujuan</FormLabel>
                <Input
                  height={"60px"}
                  bgColor={"terang"}
                  onChange={(e) =>
                    handleSubmitChange("namaTujuan", e.target.value)
                  }
                  placeholder="Contoh: Puskesmas Lolo"
                />
              </FormControl>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>uang transport</FormLabel>
                <Input
                  height={"60px"}
                  type="number"
                  bgColor={"terang"}
                  onChange={(e) =>
                    handleSubmitChange("uangTransport", e.target.value)
                  }
                  placeholder="Contoh: Rp. 450.000"
                />
              </FormControl>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Durasi</FormLabel>
                <Input
                  height={"60px"}
                  bgColor={"terang"}
                  type="number"
                  onChange={(e) => handleSubmitChange("durasi", e.target.value)}
                  placeholder="4 jam"
                />
              </FormControl>
              <FormControl border={0} flex="1">
                <FormLabel fontSize={"24px"}>Induk Unit Kerja</FormLabel>
                <Select2
                  options={dataIndukUnitKerja?.map((val) => ({
                    value: val.id,
                    label: `${val.indukUnitKerja}`,
                  }))}
                  placeholder="Pilih Induk Unit Kerja"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setIndukUnitKerjaId(selectedOption.value);
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
            </Box>
            <Button variant={"primary"} onClick={tambahTujuan}>
              Tambah
            </Button>
          </ModalBody>

          <ModalFooter pe={"60px"} pb={"30px"}></ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default DalamKotaAdmin;
