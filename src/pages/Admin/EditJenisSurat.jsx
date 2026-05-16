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
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { BsPencilFill } from "react-icons/bs";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function EditJenisSurat() {
  const [dataJenisSurat, setDataJenisSurat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const toast = useToast();

  async function fetchDataJenisSurat() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/nomor-surat/get`)
      .then((res) => {
        console.log(res.status, res.data, "tessss");

        setDataJenisSurat(res.data.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  useEffect(() => {
    fetchDataJenisSurat();
  }, []);

  const handleEdit = (id, currentValue) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSave = async (id) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/nomor-surat/edit/nomor/${id}`,
        {
          nomorSurat: editValue,
        }
      );

      // Update data lokal setelah berhasil update di API
      setDataJenisSurat(
        dataJenisSurat.map((item) =>
          item.id === id ? { ...item, nomorSurat: editValue } : item
        )
      );

      setEditingId(null);
      toast({
        title: "Berhasil",
        description: "Nomor surat berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui nomor surat",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          borderRadius={"6px"}
          maxW={"1280px"}
          variant={"primary"}
          p={"30px"}
          my={"30px"}
        >
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>NO</Th>
                <Th>Jenis Surat</Th>
                <Th>Nomor Surat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataJenisSurat?.map((item, index) => (
                <Tr key={item.id}>
                  <Td>{index + 1}</Td>
                  <Td>{item.jenis}</Td>
                  <Td>
                    {editingId === item.id ? (
                      <HStack>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          size="sm"
                        />
                      </HStack>
                    ) : (
                      item.nomorSurat
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <>
                        {" "}
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleSave(item.id)}
                        >
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => setEditingId(null)}
                        >
                          Batal
                        </Button>
                      </>
                    ) : (
                      <Button
                        p={"0px"}
                        fontSize={"14px"}
                        variant={"primary"}
                        onClick={() => handleEdit(item.id, item.nomorSurat)}
                        isDisabled={editingId === item.id}
                      >
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

export default EditJenisSurat;
