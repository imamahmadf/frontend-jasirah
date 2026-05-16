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
        }/persediaan/get?page=${page}&limit=${limit}`
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
                  rows.push({
                    obNama,
                    rinObNama,
                    tipeNama,
                    persediaanNama: p?.nama ?? "",
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
        rows.push({
          obNama: ob?.nama ?? "",
          rinObNama: rin?.nama ?? "",
          tipeNama: tipe?.nama ?? "",
          persediaanNama: item?.nama ?? "",
        });
      });
    }

    return rows;
  }, [DataPersediaan]);

  // Susun data dengan informasi rowSpan sehingga kolom grup tampil sekali (ke bawah)
  const groupedRows = useMemo(() => {
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
      tipeMap.get(tipeKey).push(row);
    });

    const result = [];
    for (const [obName, rinMap] of obMap.entries()) {
      // hitung total leaf row di bawah ob
      let obRowCount = 0;
      for (const [, tipeMap] of rinMap.entries()) {
        for (const [, rows] of tipeMap.entries()) {
          obRowCount += rows.length;
        }
      }
      let isFirstObRow = true;

      for (const [rinName, tipeMap] of rinMap.entries()) {
        let rinRowCount = 0;
        for (const [, rows] of tipeMap.entries()) {
          rinRowCount += rows.length;
        }
        let isFirstRinRow = true;

        for (const [tipeName, rows] of tipeMap.entries()) {
          const tipeRowCount = rows.length;
          let isFirstTipeRow = true;
          for (const row of rows) {
            result.push({
              obNama: obName,
              showOb: isFirstObRow,
              obRowSpan: isFirstObRow ? obRowCount : undefined,
              rinObNama: rinName,
              showRin: isFirstRinRow,
              rinRowSpan: isFirstRinRow ? rinRowCount : undefined,
              tipeNama: tipeName,
              showTipe: isFirstTipeRow,
              tipeRowSpan: isFirstTipeRow ? tipeRowCount : undefined,
              persediaanNama: row.persediaanNama,
            });
            isFirstObRow = false;
            isFirstRinRow = false;
            isFirstTipeRow = false;
          }
        }
      }
    }

    return result;
  }, [flattenedData]);

  // Susun baris linear seperti contoh: tiap level (Ob/Rin/Tipe/Persediaan) jadi satu baris, dengan kode hanya untuk Tipe dan Persediaan
  const linearHierarchyRows = useMemo(() => {
    const rows = [];

    // Jika DataPersediaan berbentuk hirarki penuh (array Ob)
    if (
      Array.isArray(DataPersediaan) &&
      DataPersediaan.length > 0 &&
      Array.isArray(DataPersediaan[0]?.rinObPersediaans)
    ) {
      DataPersediaan.forEach((ob) => {
        rows.push({ level: "ob", name: ob?.nama ?? "", code: "", nusp: "" });
        const obKode = ob?.kode ?? "";
        ob?.rinObPersediaans?.forEach((rin) => {
          rows.push({
            level: "rin",
            name: rin?.nama ?? "",
            code: "",
            nusp: "",
          });
          const rinKode = rin?.kode ?? "";
          rin?.tipePersediaans?.forEach((tipe) => {
            const tipeKode = tipe?.kodeRekening ?? "";
            const tipeCodeFull = [obKode, rinKode, tipeKode]
              .filter(Boolean)
              .join(".");
            rows.push({
              level: "tipe",
              name: tipe?.nama ?? "",
              code: tipeCodeFull,
              nusp: "",
            });
            tipe?.persediaans?.forEach((p) => {
              const kodeBarang = p?.kodeBarang ?? "";
              const barangCodeFull = [tipeCodeFull, kodeBarang]
                .filter(Boolean)
                .join(".");
              rows.push({
                level: "persediaan",
                name: p?.nama ?? "",
                code: barangCodeFull,
                nusp: p?.NUSP ?? "",
              });
            });
          });
        });
      });
      return rows;
    }

    // Jika DataPersediaan berbentuk flat (daftar persediaan), kelompokkan agar membentuk hirarki
    const obMap = new Map();
    DataPersediaan?.forEach((item) => {
      const tipe = item?.tipePersediaan;
      const rin = tipe?.rinObPersediaan ?? tipe?.rinOb;
      const ob = rin?.obPersediaan ?? rin?.ob;
      const obKey = `${ob?.kode ?? ""}|${ob?.nama ?? ""}`;
      const rinKey = `${rin?.kode ?? ""}|${rin?.nama ?? ""}`;
      const tipeKey = `${tipe?.kodeRekening ?? ""}|${tipe?.nama ?? ""}`;

      if (!obMap.has(obKey)) {
        obMap.set(obKey, { meta: ob, rinMap: new Map() });
      }
      const rinMap = obMap.get(obKey).rinMap;
      if (!rinMap.has(rinKey)) {
        rinMap.set(rinKey, { meta: rin, tipeMap: new Map() });
      }
      const tipeMap = rinMap.get(rinKey).tipeMap;
      if (!tipeMap.has(tipeKey)) {
        tipeMap.set(tipeKey, { meta: tipe, items: [] });
      }
      tipeMap.get(tipeKey).items.push(item);
    });

    for (const [obKey, obVal] of obMap.entries()) {
      const [, obNama] = obKey.split("|");
      const obKode = obVal?.meta?.kode ?? "";
      rows.push({ level: "ob", name: obNama, code: "", nusp: "" });
      for (const [rinKey, rinVal] of obVal.rinMap.entries()) {
        const [, rinNama] = rinKey.split("|");
        const rinKode = rinVal?.meta?.kode ?? "";
        rows.push({ level: "rin", name: rinNama, code: "", nusp: "" });
        for (const [tipeKey, tipeVal] of rinVal.tipeMap.entries()) {
          const [tipeKode, tipeNama] = tipeKey.split("|");
          const tipeCodeFull = [obKode, rinKode, tipeKode]
            .filter(Boolean)
            .join(".");
          rows.push({
            level: "tipe",
            name: tipeNama,
            code: tipeCodeFull,
            nusp: "",
          });
          for (const p of tipeVal.items) {
            const barangCodeFull = [tipeCodeFull, p?.kodeBarang ?? ""]
              .filter(Boolean)
              .join(".");
            rows.push({
              level: "persediaan",
              name: p?.nama ?? "",
              code: barangCodeFull,
              nusp: p?.NUSP ?? "",
            });
          }
        }
      }
    }

    return rows;
  }, [DataPersediaan]);
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
            <Table>
              <Thead bgColor={"aset"}>
                <Tr>
                  <Th color={"white"}>Uraian</Th>
                  <Th color={"white"}>Kode</Th>
                  <Th color={"white"}>NUSP</Th>
                </Tr>
              </Thead>
              <Tbody>
                {linearHierarchyRows?.map((row, index) => {
                  const paddingLeft =
                    row.level === "ob"
                      ? 6
                      : row.level === "rin"
                      ? 6
                      : row.level === "tipe"
                      ? 10
                      : 14;
                  const isTipe = row.level === "tipe";
                  return (
                    <Tr
                      border="1px solid"
                      key={`${row.level}-${row.name}-${row.code}-${index}`}
                      bg={
                        row.level === "tipe"
                          ? "blue.100"
                          : row.level === "rin"
                          ? "blue.200"
                          : row.level === "ob"
                          ? "blue.300"
                          : undefined
                      }
                    >
                      <Td border="1px solid" pl={`${paddingLeft}`}>
                        {row.name}
                      </Td>
                      <Td border="1px solid">{row.code}</Td>
                      <Td border="1px solid">{row.nusp || ""}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Container>{" "}
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
                    <FormLabel fontSize={"24px"}>Jenis Kendaraan</FormLabel>
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
