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
  useToast,
  Badge,
  VStack,
  Divider,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { BsPencilFill } from "react-icons/bs";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function NomorSuratAdmin() {
  const user = useSelector(userRedux);
  const [dataNomorSurat, setDataNomorSurat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    nomorLoket: "",
  });
  const toast = useToast();

  async function fetchDataNomorSurat() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/nomor-surat/get/${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");

        setDataNomorSurat(res.data.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
  useEffect(() => {
    fetchDataNomorSurat();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      nomorLoket: item.nomorLoket,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/nomor-surat/edit/${id}`,
        editData
      );
      toast({
        title: "Berhasil",
        description: "Data berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingId(null);
      fetchDataNomorSurat();
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

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>jenis nomor surat</Th>
                <Th>Nomor Surat</Th>
                <Th>Nomor Loket</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataNomorSurat?.map((item, index) => (
                <Tr key={item.id}>
                  <Td>{index + 1}</Td>
                  <Td>{item.jenisSurat.jenis}</Td>
                  <Td>{item.jenisSurat.nomorSurat}</Td>
                  <Td>
                    {editingId === item.id ? (
                      <Input
                        value={editData.nomorLoket}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            nomorLoket: e.target.value,
                          })
                        }
                      />
                    ) : (
                      item.nomorLoket
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <HStack spacing={2}>
                        <Button
                          variant={"primary"}
                          onClick={() => handleSave(item.id)}
                        >
                          Simpan
                        </Button>
                        <Button variant={"cancle"} onClick={handleCancel}>
                          Batal
                        </Button>
                      </HStack>
                    ) : (
                      <Button
                        p={"0px"}
                        fontSize={"14px"}
                        variant={"secondary"}
                        onClick={() => handleEdit(item)}
                      >
                        {" "}
                        <BsPencilFill />
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

export default NomorSuratAdmin;
