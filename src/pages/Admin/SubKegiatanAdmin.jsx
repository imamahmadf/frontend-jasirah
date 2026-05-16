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
  Select,
  useToast,
  Badge,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Spacer,
  Flex,
  useDisclosure,
  Collapse,
  IconButton,
} from "@chakra-ui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function SubKegiatanAdmin() {
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [dataTipe, setDataTipe] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [kodeRekening, setKodeRekening] = useState("");
  const [subKegiatan, setSubKegiatan] = useState("");
  const [subKegiatanId, setSubKegiatanId] = useState(0);
  const [anggaran, setAnggaran] = useState(0);
  const [tahun, setTahun] = useState("");
  const [tipePerjalananId, setTipePerjalananId] = useState(0);
  const [filterTahun, setFilterTahun] = useState("2025");
  const [expandedItems, setExpandedItems] = useState({});
  const [editForm, setEditForm] = useState({
    kodeRekening: "",
    subKegiatan: "",
    anggaran: "",
  });
  const [editAnggaranForm, setEditAnggaranForm] = useState({
    anggaran: "",
    subKegiatanId: 0,
    tipePerjalananId: 0,
    id: null,
  });
  const toast = useToast();
  const user = useSelector(userRedux);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const {
    isOpen: isAnggaranOpen,
    onOpen: onAnggaranOpen,
    onClose: onAnggaranClose,
  } = useDisclosure();

  const {
    isOpen: isEditAnggaranOpen,
    onOpen: onEditAnggaranOpen,
    onClose: onEditAnggaranClose,
  } = useDisclosure();

  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "kodeRekening") {
      setKodeRekening(val);
    } else if (field == "subKegiatan") {
      setSubKegiatan(val);
    } else if (field == "anggaran") {
      setAnggaran(parseInt(val));
    } else if (field == "tahun") {
      setTahun(val);
    }
  };
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseRupiah = (str) => {
    if (!str) return 0;
    const onlyDigits = str.toString().replace(/[^0-9]/g, "");
    return onlyDigits ? parseInt(onlyDigits, 10) : 0;
  };
  const tambahSubKegiatan = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/sub-kegiatan/post`,
        {
          kodeRekening,
          subKegiatan,

          unitKerjaId: user[0]?.unitKerja_profile?.id,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataSubKegiatan();
        onTambahClose();
        toast({
          title: "Berhasil",
          description: "Berhasil Menambah subKegiatan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  };

  const tambahAnggaran = () => {
    console.log(anggaran, tahun, tipePerjalananId, subKegiatanId);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/post/anggaran`,
        {
          nilai: anggaran,
          tahun,
          tipePerjalananId,
          subKegiatanId,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataSubKegiatan();
        onAnggaranClose();
        toast({
          title: "Berhasil",
          description: "Berhasil Menambah Anggaran",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  };

  async function fetchDataSubKegiatan() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/sub-kegiatan/get/${
          user[0]?.unitKerja_profile?.id
        }?&filterTahun=${filterTahun}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");

        setDataSubKegiatan(res.data.result);
        setDataTipe(res.data.resultTipe);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
  useEffect(() => {
    fetchDataSubKegiatan();
  }, [filterTahun]);

  const handleEdit = (item) => {
    if (editingId !== null) {
      toast({
        title: "Peringatan",
        description: "Selesaikan edit yang sedang berlangsung terlebih dahulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEditingId(item.id);
    setEditForm({
      kodeRekening: item.kodeRekening,
      subKegiatan: item.subKegiatan,
      anggaran: item.anggaran,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/edit/${id}`,
        editForm
      );

      toast({
        title: "Berhasil",
        description: "Data berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingId(null);
      fetchDataSubKegiatan();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEditAnggaran = (
    subKegiatanId,
    anggaranValue,
    tipePerjalananId,
    id
  ) => {
    setEditAnggaranForm({
      anggaran: anggaranValue,
      // subKegiatanId: subKegiatanId,
      // tipePerjalananId: tipePerjalananId,
      id: id,
    });
    onEditAnggaranOpen();
  };

  const handleUpdateAnggaran = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/edit/anggaran`,
        {
          nilai: parseInt(editAnggaranForm.anggaran),
          // tahun: filterTahun,
          // subKegiatanId: editAnggaranForm.subKegiatanId,
          // tipePerjalananId: editAnggaranForm.tipePerjalananId,
          id: editAnggaranForm.id,
        }
      );

      toast({
        title: "Berhasil",
        description: "Anggaran berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditAnggaranClose();
      fetchDataSubKegiatan();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal memperbarui anggaran",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} px={"30px"}>
        <Container variant={"primary"} maxW={"2880px"} p={"30px"}>
          {" "}
          <Button onClick={onTambahOpen} mb={"30px"} variant={"primary"}>
            Tambah +
          </Button>{" "}
          <FormControl mb={"50px"}>
            <FormLabel>Tahun Anggaran</FormLabel>
            <Select
              mt="10px"
              border="1px"
              borderRadius={"8px"}
              borderColor={"rgba(229, 231, 235, 1)"}
              onChange={(e) => {
                setFilterTahun(e.target.value);
              }}
            >
              <option value="2025">2025 </option>
              <option value="2026">2026</option>
              <option value="2027">2027 </option>
              <option value="2028">2028</option>
              <option value="2029">2029 </option>
            </Select>
          </FormControl>
          <VStack spacing={4} align="stretch">
            {dataSubKegiatan?.map((item, index) => {
              // Hitung total anggaran dan realisasi
              const totalAnggaran =
                item.anggaranByTipe?.reduce(
                  (sum, tipe) => sum + (tipe.anggaran || 0),
                  0
                ) || 0;
              const totalRealisasi =
                item.anggaranByTipe?.reduce(
                  (sum, tipe) => sum + (tipe.totalRealisasi || 0),
                  0
                ) || 0;
              const totalSisa = totalAnggaran - totalRealisasi;
              const totalPersen =
                totalAnggaran > 0
                  ? ((totalRealisasi / totalAnggaran) * 100).toFixed(2)
                  : "-";

              return (
                <Card
                  key={item.id}
                  variant="outline"
                  borderRadius="lg"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md" }}
                >
                  <CardBody p={4}>
                    {/* Header Card */}
                    <Flex
                      justify="space-between"
                      align="flex-start"
                      mb={4}
                      flexWrap="wrap"
                      gap={4}
                    >
                      <Box flex={1} minW="300px">
                        <Heading size="md" mb={2} color="gray.700">
                          {editingId === item.id ? (
                            <Input
                              value={editForm.subKegiatan}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  subKegiatan: e.target.value,
                                })
                              }
                              mb={2}
                            />
                          ) : (
                            item.subKegiatan
                          )}
                        </Heading>
                        <VStack align="flex-start" spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            <strong>Kode Rekening:</strong>{" "}
                            {editingId === item.id ? (
                              <Input
                                size="sm"
                                value={editForm.kodeRekening}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    kodeRekening: e.target.value,
                                  })
                                }
                                maxW="200px"
                                display="inline-block"
                              />
                            ) : (
                              item.kodeRekening
                            )}
                          </Text>
                          <HStack spacing={6} flexWrap="wrap">
                            <Text fontSize="sm" color="gray.600">
                              <strong>Total Anggaran:</strong>{" "}
                              <Text
                                as="span"
                                color="blue.600"
                                fontWeight="bold"
                              >
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(totalAnggaran)}
                              </Text>
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              <strong>Total Realisasi:</strong>{" "}
                              <Text
                                as="span"
                                color="green.600"
                                fontWeight="bold"
                              >
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(totalRealisasi)}
                              </Text>
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              <strong>Presentase:</strong>{" "}
                              <Text as="span" fontWeight="bold">
                                {totalPersen === "-" ? "-" : `${totalPersen}%`}
                              </Text>
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>

                      <HStack spacing={2} align="flex-start">
                        {editingId === item.id ? (
                          <VStack spacing={2}>
                            <Button
                              colorScheme="green"
                              size="sm"
                              onClick={() => handleSave(item.id)}
                            >
                              Simpan
                            </Button>
                            <Button
                              colorScheme="red"
                              size="sm"
                              onClick={handleCancel}
                            >
                              Batal
                            </Button>
                          </VStack>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                onAnggaranOpen();
                                setSubKegiatanId(item.id);
                              }}
                            >
                              Anggaran
                            </Button>
                            <IconButton
                              icon={
                                expandedItems[item.id] ? (
                                  <BsChevronUp />
                                ) : (
                                  <BsChevronDown />
                                )
                              }
                              onClick={() => toggleExpand(item.id)}
                              aria-label="Toggle detail"
                              variant="ghost"
                              size="sm"
                            />
                          </>
                        )}
                      </HStack>
                    </Flex>

                    {/* Collapsible Detail Section */}
                    <Collapse in={expandedItems[item.id]} animateOpacity>
                      <Box
                        mt={4}
                        pt={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                      >
                        <VStack spacing={4} align="stretch">
                          {item.anggaranByTipe?.map((tipe, tipeIndex) => {
                            const sisa = tipe.anggaran - tipe.totalRealisasi;
                            const persen =
                              tipe.anggaran > 0
                                ? (
                                    (tipe.totalRealisasi / tipe.anggaran) *
                                    100
                                  ).toFixed(2)
                                : "-";

                            return (
                              <Box key={tipeIndex}>
                                <Heading
                                  size="sm"
                                  mb={3}
                                  color="gray.700"
                                  textTransform="uppercase"
                                  letterSpacing="wide"
                                >
                                  {tipe.tipePerjalananId === 1
                                    ? "Dalam Daerah"
                                    : "Luar Daerah"}
                                </Heading>
                                <Box
                                  overflowX="auto"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                >
                                  <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                      <Tr>
                                        <Th>Anggaran</Th>
                                        <Th>Realisasi</Th>
                                        <Th>Presentase</Th>
                                        <Th>Sisa</Th>
                                        <Th>Aksi</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      <Tr>
                                        <Td>
                                          {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                          }).format(tipe.anggaran)}
                                        </Td>
                                        <Td>
                                          {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                          }).format(tipe.totalRealisasi)}
                                        </Td>
                                        <Td>
                                          {persen === "-" ? "-" : `${persen}%`}
                                        </Td>
                                        <Td
                                          bgColor={
                                            sisa < 0 ? "red.100" : undefined
                                          }
                                          color={
                                            sisa < 0 ? "red.700" : undefined
                                          }
                                          fontWeight={
                                            sisa < 0 ? "bold" : "normal"
                                          }
                                        >
                                          {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                          }).format(sisa)}
                                        </Td>
                                        <Td>
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            colorScheme="blue"
                                            onClick={() =>
                                              handleEditAnggaran(
                                                item.id,
                                                tipe.anggaran,
                                                tipe.tipePerjalananId,
                                                tipe.id || null
                                              )
                                            }
                                          >
                                            Edit
                                          </Button>
                                        </Td>
                                      </Tr>
                                    </Tbody>
                                  </Table>
                                </Box>
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    </Collapse>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
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
                <Heading color={"primary"}>Tambah Sub Kegiatan</Heading>
              </HStack>
              <Box p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Kode Rekening</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("kodeRekening", e.target.value)
                    }
                    placeholder="Contoh: 1.02.01.2.05.05"
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Sub Kegiatan</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("subKegiatan", e.target.value)
                    }
                    placeholder="Contoh: Monitoring, Evaluasi, dan Penilaian Kinerja Pegawai"
                  />
                </FormControl>
                {/* <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Anggaran</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="number"
                    onChange={(e) =>
                      handleSubmitChange("anggaran", e.target.value)
                    }
                    placeholder="RP. 3400000"
                  />
                </FormControl> */}
              </Box>
              <Button variant={"primary"} onClick={tambahSubKegiatan}>
                Tambah
              </Button>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}></ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          closeOnOverlayClick={false}
          isOpen={isAnggaranOpen}
          onClose={onAnggaranClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="1200px">
            <ModalHeader></ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <HStack>
                <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                <Heading color={"primary"}>Anggaran Sub Kegiatan</Heading>
              </HStack>
              <Box p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Anggaran</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(anggaran)}
                    onChange={(e) => {
                      const parsed = parseRupiah(e.target.value);
                      handleSubmitChange("anggaran", parsed);
                    }}
                    placeholder="Contoh: Rp. 1.000.000.000"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"24px"}>Sumber Dana</FormLabel>
                  <Select2
                    options={dataTipe?.map((val) => {
                      return {
                        value: val.id,
                        label: `${val.tipe}`,
                      };
                    })}
                    focusBorderColor="red"
                    onChange={(selectedOption) => {
                      setTipePerjalananId(selectedOption.value);
                    }}
                    components={{
                      DropdownIndicator: () => null, // Hilangkan tombol panah
                      IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "0px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        color: "gelap",
                        textTransform: "none",
                        border: "0px",

                        height: "30px",
                        _hover: {
                          borderColor: "yellow.700",
                        },
                        minHeight: "60px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "primary" : "white",
                        color: state.isFocused ? "white" : "gelap",
                        textTransform: "none",
                      }),
                    }}
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tahun</FormLabel>
                  <Input
                    type="month"
                    height={"60px"}
                    bgColor={"terang"}
                    onChange={(e) =>
                      handleSubmitChange("tahun", e.target.value)
                    }
                    placeholder="Contoh: 2025"
                    min="2000"
                    max="2100"
                  />
                </FormControl>
              </Box>
              <Button variant={"primary"} onClick={tambahAnggaran}>
                Tambah
              </Button>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}></ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          closeOnOverlayClick={false}
          isOpen={isEditAnggaranOpen}
          onClose={onEditAnggaranClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="1200px">
            <ModalHeader></ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <HStack>
                <Box bgColor={"primary"} width={"30px"} height={"30px"}></Box>
                <Heading color={"primary"}>Edit Anggaran Sub Kegiatan</Heading>
              </HStack>
              <Box p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tahun Anggaran</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    value={filterTahun}
                    readOnly
                    disabled
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tipe Perjalanan</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    value={
                      editAnggaranForm.tipePerjalananId === 1
                        ? "Dalam Daerah"
                        : editAnggaranForm.tipePerjalananId === 2
                        ? "Luar Daerah"
                        : ""
                    }
                    readOnly
                    disabled
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Anggaran</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="number"
                    value={editAnggaranForm.anggaran}
                    onChange={(e) =>
                      setEditAnggaranForm({
                        ...editAnggaranForm,
                        anggaran: e.target.value,
                      })
                    }
                    placeholder="Contoh: Rp. 1.000.000.000"
                  />
                </FormControl>
              </Box>
              <Button variant={"primary"} onClick={handleUpdateAnggaran}>
                Simpan
              </Button>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}></ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}

export default SubKegiatanAdmin;
