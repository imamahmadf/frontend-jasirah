import React, { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
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

function DaftarPersediaan() {
  const [DataPersediaan, setDataPersediaan] = useState([]);
  const history = useHistory();
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [tipeId, setTipeId] = useState(0);
  const [kode, setKode] = useState("");
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [nama, setNama] = useState("");
  const [NUSP, setNUSP] = useState("");
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
    if (field == "kode") {
      setKode(val);
    } else if (field == "nama") {
      setNama(val);
    } else if (field == "NUSP") {
      setNUSP(val);
    }
  };

  async function fetchDataPersediaan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/persediaan/get?page=${page}&limit=${limit}`,
      )
      .then((res) => {
        setDataPersediaan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        console.log(res.data.result, "INI DATA");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Meratakan data hierarki menjadi baris tabel: Ob -> RinOb -> Tipe -> Persediaan
  const flattenedData = useMemo(() => {
    const rows = [];
    if (!Array.isArray(DataPersediaan)) return rows;

    // Coba asumsi data bertingkat (obPersediaan -> rinObPersediaans -> tipePersediaans -> persediaans)
    DataPersediaan.forEach((ob) => {
      const obNama = ob?.nama ?? "";
      if (
        Array.isArray(ob?.rinObPersediaans) &&
        ob.rinObPersediaans.length > 0
      ) {
        ob.rinObPersediaans.forEach((rin) => {
          const rinObNama = rin?.nama ?? "";
          if (
            Array.isArray(rin?.tipePersediaans) &&
            rin.tipePersediaans.length > 0
          ) {
            rin.tipePersediaans.forEach((tipe) => {
              const tipeNama = tipe?.nama ?? "";
              if (
                Array.isArray(tipe?.persediaans) &&
                tipe.persediaans.length > 0
              ) {
                tipe.persediaans.forEach((p) => {
                  const tipeCodeFull = [ob?.kode, rin?.kode, tipe?.kodeRekening]
                    .filter(Boolean)
                    .join(".");
                  const barangCodeFull = [tipeCodeFull, p?.kodeBarang ?? ""]
                    .filter(Boolean)
                    .join(".");
                  rows.push({
                    obNama,
                    rinObNama,
                    tipeNama,
                    persediaanNama: p?.nama ?? "",
                    kode: barangCodeFull,
                    nusp: p?.NUSP ?? "",
                  });
                });
              }
            });
          }
        });
      }
    });

    // Jika tidak ada baris (berarti data kemungkinan sudah flat per-persediaan)
    if (rows.length === 0) {
      DataPersediaan.forEach((item) => {
        const tipe = item?.tipePersediaan;
        const rin = tipe?.rinObPersediaan ?? tipe?.rinOb; // fallback penamaan relasi
        const ob = rin?.obPersediaan ?? rin?.ob; // fallback penamaan relasi
        const tipeCodeFull = [ob?.kode, rin?.kode, tipe?.kodeRekening]
          .filter(Boolean)
          .join(".");
        const barangCodeFull = [tipeCodeFull, item?.kodeBarang ?? ""]
          .filter(Boolean)
          .join(".");
        rows.push({
          obNama: ob?.nama ?? "",
          rinObNama: rin?.nama ?? "",
          tipeNama: tipe?.nama ?? "",
          persediaanNama: item?.nama ?? "",
          kode: barangCodeFull,
          nusp: item?.NUSP ?? "",
        });
      });
    }

    return rows;
  }, [DataPersediaan]);

  const hierarchyTree = useMemo(() => {
    if (!Array.isArray(flattenedData) || flattenedData.length === 0) return [];

    const obMap = new Map();
    flattenedData.forEach((row) => {
      const obKey = row.obNama || "";
      const rinKey = row.rinObNama || "";
      const tipeKey = row.tipeNama || "";
      if (!obMap.has(obKey)) obMap.set(obKey, new Map());
      const rinMap = obMap.get(obKey);
      if (!rinMap.has(rinKey)) rinMap.set(rinKey, new Map());
      const tipeMap = rinMap.get(rinKey);
      if (!tipeMap.has(tipeKey)) tipeMap.set(tipeKey, []);
      tipeMap.get(tipeKey).push({
        persediaanNama: row.persediaanNama,
        kode: row.kode ?? "",
        nusp: row.nusp ?? "",
      });
    });

    return Array.from(obMap.entries()).map(([obNama, rinMap]) => {
      const rinList = Array.from(rinMap.entries()).map(
        ([rinObNama, tipeMap]) => {
          const tipeList = Array.from(tipeMap.entries()).map(
            ([tipeNama, items]) => ({
              tipeNama,
              items,
            }),
          );
          const barangCount = tipeList.reduce(
            (sum, t) => sum + t.items.length,
            0,
          );
          return { rinObNama, tipeList, barangCount };
        },
      );
      const barangCount = rinList.reduce((sum, r) => sum + r.barangCount, 0);
      return { obNama, rinList, barangCount };
    });
  }, [flattenedData]);

  const tambahPersediaan = () => {
    axios
      .post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/post`, {
        nama,
        kode,
        NUSP,
        tipeId,
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
        fetchDataPersediaan();
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
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/seed`)
      .then((res) => {
        console.log(res.data);
        setDataSeed(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataPersediaan();
    fetchSeed();
  }, [page]);
  return (
    <>
      <LayoutAset>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"5px"}
            maxW={"1280px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            {" "}
            <HStack gap={5} mb={"30px"}>
              <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
                Tambah +
              </Button>

              <Spacer />
            </HStack>{" "}
            {hierarchyTree.length === 0 ? (
              <Box textAlign="center" py={8} color="gray.500">
                Tidak ada data persediaan
              </Box>
            ) : (
              <Accordion allowMultiple reduceMotion>
                {hierarchyTree.map((ob, obIndex) => (
                  <AccordionItem
                    key={`ob-${obIndex}-${ob.obNama}`}
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    mb={3}
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <AccordionButton
                      bg={colorMode === "dark" ? "blue.900" : "blue.100"}
                      _hover={{
                        bg: colorMode === "dark" ? "blue.800" : "blue.200",
                      }}
                      py={4}
                    >
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold" fontSize="md">
                          Objek: {ob.obNama}
                        </Text>
                      </Box>
                      <Badge mr={3} colorScheme="blue">
                        {ob.barangCount} barang
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} px={3}>
                      <Accordion allowMultiple reduceMotion>
                        {ob.rinList.map((rin, rinIndex) => (
                          <AccordionItem
                            key={`rin-${obIndex}-${rinIndex}-${rin.rinObNama}`}
                            border="1px solid"
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                            mb={2}
                            borderRadius="md"
                            overflow="hidden"
                          >
                            <AccordionButton
                              bg={colorMode === "dark" ? "blue.800" : "blue.50"}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "blue.700"
                                    : "blue.100",
                              }}
                              py={3}
                              pl={6}
                            >
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="semibold">
                                  Rincian Objek: {rin.rinObNama}
                                </Text>
                              </Box>
                              <Badge mr={3} colorScheme="cyan">
                                {rin.barangCount} barang
                              </Badge>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={3} px={2}>
                              <Accordion allowMultiple reduceMotion>
                                {rin.tipeList.map((tipe, tipeIndex) => (
                                  <AccordionItem
                                    key={`tipe-${obIndex}-${rinIndex}-${tipeIndex}-${tipe.tipeNama}`}
                                    border="1px solid"
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    mb={2}
                                    borderRadius="md"
                                    overflow="hidden"
                                  >
                                    <AccordionButton
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.50"
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.100",
                                      }}
                                      py={3}
                                      pl={8}
                                    >
                                      <Box flex="1" textAlign="left">
                                        <Text fontWeight="medium">
                                          Tipe: {tipe.tipeNama}
                                        </Text>
                                      </Box>
                                      <Badge mr={3} colorScheme="gray">
                                        {tipe.items.length} barang
                                      </Badge>
                                      <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel p={0}>
                                      <Table size="sm" variant="simple">
                                        <Thead bgColor="aset">
                                          <Tr>
                                            <Th color="white">Uraian Barang</Th>
                                            <Th color="white">Kode</Th>
                                            <Th color="white">NUSP</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {tipe.items.map((item, itemIndex) => (
                                            <Tr
                                              key={`item-${obIndex}-${rinIndex}-${tipeIndex}-${itemIndex}`}
                                              _hover={{
                                                bg:
                                                  colorMode === "dark"
                                                    ? "gray.700"
                                                    : "gray.50",
                                              }}
                                            >
                                              <Td pl={10}>
                                                {item.persediaanNama}
                                              </Td>
                                              <Td
                                                fontFamily="mono"
                                                fontSize="sm"
                                              >
                                                {item.kode}
                                              </Td>
                                              <Td>{item.nusp}</Td>
                                            </Tr>
                                          ))}
                                        </Tbody>
                                      </Table>
                                    </AccordionPanel>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Container>{" "}
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
                    <FormLabel fontSize={"24px"}>Kode Barang</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("kode", e.target.value)
                      }
                      placeholder="Contoh:1405"
                    />
                  </FormControl>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Nama barang</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("nama", e.target.value)
                      }
                      placeholder="Contoh: Kertas Cover"
                    />
                  </FormControl>

                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>NUSP</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      onChange={(e) =>
                        handleSubmitChange("NUSP", e.target.value)
                      }
                      placeholder="Contoh: 005"
                    />
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    border={0}
                    bgColor={"white"}
                    flex="1"
                  >
                    <FormLabel fontSize={"24px"}>Tipe Persediaan</FormLabel>
                    <Select2
                      options={dataSeed?.resultTipe?.map((val) => ({
                        value: val.id,
                        label: `${val.nama}`,
                      }))}
                      placeholder="Contoh: Roda Dua"
                      focusBorderColor="red"
                      onChange={(selectedOption) => {
                        setTipeId(selectedOption.value);
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

export default DaftarPersediaan;
