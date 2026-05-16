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
  FormControl,
  FormLabel,
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
  useToast,
  Badge,
  VStack,
  Divider,
  Spacer,
  useDisclosure,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";

function SumberDanaAdmin() {
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState(null);
  const [dataPelayanan, setDataPelayanan] = useState(null);
  const [dataUangharian, setDataUangHarian] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    sumber: "",
    untukPembayaran: "",
    kalimat1: "",
    kalimat2: "",
  });
  const [editingJenisId, setEditingJenisId] = useState(null);
  const [editJenisForm, setEditJenisForm] = useState({
    jenis: "",
    kodeRekening: "",
  });
  const [editPelayananForm, setEditPelayananForm] = useState({
    jenis: "",
    uangTransport: 0,
  });
  const [editUangHarian, setEditUangHarian] = useState({
    nilai: 0,
  });
  const [editingPelayananId, setEditingPelayananId] = useState(null);
  const [editingUangHarianId, setEditingUangHarianId] = useState(null);
  const [editUangHarianForm, setEditUangHarianForm] = useState({
    nilai: 0,
  });
  const toast = useToast();

  async function fetchDataSumberDana() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/get/all-sumber-dana`
      )
      .then((res) => {
        console.log(res.data);
        setDataSumberDana(res.data.result);
        setDataJenisPerjalanan(res.data.resultJenisPerjalanan);
        setDataPelayanan(res.data.resultPelayanan);
        setDataUangHarian(res.data.resultUangHarian);
      })
      .catch((err) => {
        console.error(err); // Tangani error
      });
  }

  useEffect(() => {
    fetchDataSumberDana();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      sumber: item.sumber,
      untukPembayaran: item.untukPembayaran,
      kalimat1: item.kalimat1,
      kalimat2: item.kalimat2,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/edit/sumber-dana/${id}`,
        editForm
      );

      toast({
        title: "Berhasil",
        description: "Data sumber dana berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingId(null);
      fetchDataSumberDana();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data sumber dana",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleEditJenis = (item) => {
    setEditingJenisId(item.id);
    setEditJenisForm({
      jenis: item.jenis,
      kodeRekening: item.kodeRekening,
    });
  };

  const handleSaveJenis = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/edit/jenis-perjalanan/${id}`,
        editJenisForm
      );

      toast({
        title: "Berhasil",
        description: "Data jenis perjalanan berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingJenisId(null);
      fetchDataSumberDana();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data jenis perjalanan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelJenis = () => {
    setEditingJenisId(null);
  };

  const handleEditPelayanan = (item) => {
    setEditingPelayananId(item.id);
    setEditPelayananForm({
      jenis: item.jenis,
      uangTransport: item.uangTransport,
    });
  };

  const handleSavePelayanan = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/edit/pelayanan/${id}`,
        editPelayananForm
      );

      toast({
        title: "Berhasil",
        description: "Data pelayanan berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingPelayananId(null);
      fetchDataSumberDana();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data pelayanan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelPelayanan = () => {
    setEditingPelayananId(null);
  };

  const handleEditUangHarian = (item) => {
    setEditingUangHarianId(item.id);
    setEditUangHarianForm({
      nilai: item.nilai,
    });
  };

  const handleSaveUangHarian = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/edit/uang-harian/${id}`,
        editUangHarianForm
      );

      toast({
        title: "Berhasil",
        description: "Data uang harian berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditingUangHarianId(null);
      fetchDataSumberDana();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data uang harian",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelUangHarian = () => {
    setEditingUangHarianId(null);
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Box>
            <Heading mb={"20px"}>Sumber Dana</Heading>
            <Table variant={"primary"}>
              <Thead>
                <Tr>
                  <Th>sumber</Th>
                  <Th>Untuk Pembayaran</Th>
                  <Th>Kalimat 1</Th>
                  <Th>Kalimat 2</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataSumberDana?.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>
                      {editingId === item.id ? (
                        <Input
                          value={editForm.sumber}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sumber: e.target.value })
                          }
                        />
                      ) : (
                        item.sumber
                      )}
                    </Td>
                    <Td>
                      {editingId === item.id ? (
                        <Input
                          value={editForm.untukPembayaran}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              untukPembayaran: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.untukPembayaran
                      )}
                    </Td>
                    <Td>
                      {editingId === item.id ? (
                        <Input
                          value={editForm.kalimat1}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              kalimat1: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.kalimat1
                      )}
                    </Td>
                    <Td>
                      {editingId === item.id ? (
                        <Input
                          value={editForm.kalimat2}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              kalimat2: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.kalimat2
                      )}
                    </Td>
                    <Td>
                      {editingId === item.id ? (
                        <HStack>
                          <Button
                            colorScheme="green"
                            onClick={() => handleSave(item.id)}
                          >
                            Simpan
                          </Button>
                          <Button onClick={handleCancel}>Batal</Button>
                        </HStack>
                      ) : (
                        <Button onClick={() => handleEdit(item)}>Edit</Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={"20px"}>Jenis Perjalanan</Heading>
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>Jenis</Th>
                <Th>Kode Rekening</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataJenisPerjalanan?.map((item, index) => (
                <Tr key={item.id}>
                  <Td>
                    {editingJenisId === item.id ? (
                      <Input
                        value={editJenisForm.jenis}
                        onChange={(e) =>
                          setEditJenisForm({
                            ...editJenisForm,
                            jenis: e.target.value,
                          })
                        }
                      />
                    ) : (
                      item.jenis
                    )}
                  </Td>
                  <Td>
                    {editingJenisId === item.id ? (
                      <Input
                        value={editJenisForm.kodeRekening}
                        onChange={(e) =>
                          setEditJenisForm({
                            ...editJenisForm,
                            kodeRekening: e.target.value,
                          })
                        }
                      />
                    ) : (
                      item.kodeRekening
                    )}
                  </Td>
                  <Td>
                    {editingJenisId === item.id ? (
                      <HStack>
                        <Button
                          colorScheme="green"
                          onClick={() => handleSaveJenis(item.id)}
                        >
                          Simpan
                        </Button>
                        <Button onClick={handleCancelJenis}>Batal</Button>
                      </HStack>
                    ) : (
                      <Button onClick={() => handleEditJenis(item)}>
                        Edit
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>{" "}
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={"20px"}>Pelayanan kesehatan</Heading>
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>Jenis</Th>
                <Th>Uang transport</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataPelayanan?.map((item, index) => (
                <Tr key={item.id}>
                  <Td>
                    {editingPelayananId === item.id ? (
                      <Input
                        value={editPelayananForm.jenis}
                        onChange={(e) =>
                          setEditPelayananForm({
                            ...editPelayananForm,
                            jenis: e.target.value,
                          })
                        }
                      />
                    ) : (
                      item.jenis
                    )}
                  </Td>
                  <Td>
                    {editingPelayananId === item.id ? (
                      <Input
                        type="number"
                        value={editPelayananForm.uangTransport}
                        onChange={(e) =>
                          setEditPelayananForm({
                            ...editPelayananForm,
                            uangTransport: parseInt(e.target.value),
                          })
                        }
                      />
                    ) : (
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.uangTransport)
                    )}
                  </Td>
                  <Td>
                    {editingPelayananId === item.id ? (
                      <HStack>
                        <Button
                          colorScheme="green"
                          onClick={() => handleSavePelayanan(item.id)}
                        >
                          Simpan
                        </Button>
                        <Button onClick={handleCancelPelayanan}>Batal</Button>
                      </HStack>
                    ) : (
                      <Button onClick={() => handleEditPelayanan(item)}>
                        Edit
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading mb={"20px"}>Uang Harian</Heading>
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>Nilai</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataUangharian?.map((item, index) => (
                <Tr key={item.id}>
                  <Td>
                    {editingUangHarianId === item.id ? (
                      <Input
                        type="number"
                        value={editUangHarianForm.nilai}
                        onChange={(e) =>
                          setEditUangHarianForm({
                            ...editUangHarianForm,
                            nilai: parseInt(e.target.value),
                          })
                        }
                      />
                    ) : (
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.nilai)
                    )}
                  </Td>
                  <Td>
                    {editingUangHarianId === item.id ? (
                      <HStack>
                        <Button
                          colorScheme="green"
                          onClick={() => handleSaveUangHarian(item.id)}
                        >
                          Simpan
                        </Button>
                        <Button onClick={handleCancelUangHarian}>Batal</Button>
                      </HStack>
                    ) : (
                      <Button onClick={() => handleEditUangHarian(item)}>
                        Edit
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>
      </Box>
    </Layout>
  );
}

export default SumberDanaAdmin;
