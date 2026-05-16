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
import { formatRupiah, parseRupiah } from "../../utils/formatRupiah";

function PersediaanMasuk() {
  const [DataPersediaan, setDataPersediaan] = useState([]);
  const history = useHistory();
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [spesifikasi, setSpesifikasi] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [harga, setHarga] = useState(0);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [persediaanId, setPersediaanId] = useState(0);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
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
    }
  };

  async function fetchPersediaanMasuk() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/masuk/${
          user[0]?.unitKerja_profile?.id
        }`
      )
      .then((res) => {
        setDataPersediaan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        setDataSeed(res.data.resultPersediaan);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  const tambahPersediaan = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/post/masuk`,
        {
          persediaanId,
          spesifikasi,
          jumlah,
          harga,
          tanggal,
          keterangan,
          unitKerjaId: user[0]?.unitKerja_profile?.id,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // fetchDataPersediaan();
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

  useEffect(() => {
    fetchPersediaanMasuk();
  }, [page]);
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
            {" "}
            <HStack gap={5} mb={"30px"}>
              <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
                Tambah +
              </Button>

              <Spacer />
            </HStack>{" "}
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>tanggal</Th>
                  <Th>Kode barang</Th>
                  <Th maxWidth={"20px"}>Nama barang</Th>
                  <Th>spesifikasi</Th>
                  <Th>jumlah</Th>
                  <Th>harga satuan</Th>
                </Tr>
              </Thead>
              <Tbody>
                {DataPersediaan?.map((item, index) => (
                  <Tr key={item.id}>
                    {" "}
                    <Td>{item?.tanggal}</Td>
                    <Td>{item?.persediaan.kodeBarang}</Td>
                    <Td>{item?.persediaan.nama}</Td>{" "}
                    <Td>{item?.spesifikasi}</Td>
                    <Td>{item?.jumlah}</Td>
                    <Td>{item?.hargaSatuan}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>{" "}
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
        </Box>{" "}
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
                  <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"primary"}>Tambah Pegawai</Heading>
                </HStack>

                <SimpleGrid columns={2} spacing={10} p={"30px"}>
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
                  </FormControl>{" "}
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>harga Satuan</FormLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      height={"60px"}
                      bgColor={"terang"}
                      value={formatRupiah(harga)}
                      onChange={(e) => {
                        const parsed = parseRupiah(e.target.value);
                        setHarga(parsed);
                      }}
                      placeholder="Contoh: Rp 5.000"
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>tanggal</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
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
                      placeholder="Contoh: 5000"
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
      </LayoutAset>
    </>
  );
}

export default PersediaanMasuk;
