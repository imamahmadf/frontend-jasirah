import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import { Link, useHistory } from "react-router-dom";
import Rill from "../Componets/Rill";
import { useDisclosure } from "@chakra-ui/react";
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
  Spacer,
} from "@chakra-ui/react";

function Rampung(props) {
  const [dataRampung, setDataRampung] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState(null);

  async function fetchDataRampung() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kwitansi/get/rampung/${
          props.match.params.id
        }`
      )
      .then((res) => {
        setDataRampung(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const handleEdit = (item) => {
    setEditMode(item.id);
    setEditedData({
      ...item,
    });
  };

  const handleChange = (e, field) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = (id) => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/update/rincian-bpd`,
        editedData
      )
      .then((res) => {
        setEditMode(null);
        fetchDataRampung();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchDataRampung();
  }, []);

  const groupedData =
    dataRampung.result?.rincianBPDs?.reduce((acc, item) => {
      const jenis = item.jenisRincianBPD?.jenis;
      if (!acc[jenis]) {
        acc[jenis] = [];
      }
      acc[jenis].push(item);
      return acc;
    }, {}) || {};

  return (
    <Layout>
      <Box bgColor={"rgba(249, 250, 251, 1)"} pb={"40px"}>
        <Container
          bgColor={"white"}
          borderRadius={"5px"}
          border={"1px"}
          borderColor={"rgba(229, 231, 235, 1)"}
          maxW={"1280px"}
          p={"30px"}
        >
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((jenis) => (
              <Box key={jenis} mt={4}>
                <Text fontWeight="bold" fontSize="lg">
                  {jenis}
                </Text>
                <Table variant="simple" mt={2}>
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th>Nilai</Th>
                      <Th>Qty</Th>
                      <Th>Satuan</Th>
                      <Th>Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {groupedData[jenis].map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          {editMode === item.id ? (
                            <Input
                              value={editedData.item}
                              onChange={(e) => handleChange(e, "item")}
                            />
                          ) : (
                            item.item
                          )}
                        </Td>
                        <Td>
                          {editMode === item.id ? (
                            <Input
                              type="number"
                              value={editedData.nilai}
                              onChange={(e) => handleChange(e, "nilai")}
                            />
                          ) : (
                            item.nilai
                          )}
                        </Td>
                        <Td>
                          {editMode === item.id ? (
                            <Input
                              type="number"
                              value={editedData.qty}
                              onChange={(e) => handleChange(e, "qty")}
                            />
                          ) : (
                            item.qty
                          )}
                        </Td>
                        <Td>
                          {editMode === item.id ? (
                            <Input
                              value={editedData.satuan}
                              onChange={(e) => handleChange(e, "satuan")}
                            />
                          ) : (
                            item.satuan
                          )}
                        </Td>
                        <Td>
                          {editMode === item.id ? (
                            <HStack>
                              <Button
                                colorScheme="green"
                                onClick={() => handleSave(item.id)}
                              >
                                Save
                              </Button>
                              <Button
                                colorScheme="gray"
                                onClick={() => setEditMode(null)}
                              >
                                Cancel
                              </Button>
                            </HStack>
                          ) : (
                            <HStack>
                              <Button
                                colorScheme="blue"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                colorScheme="red"
                                onClick={() => {
                                  setItemToDelete(item);
                                  onDeleteOpen();
                                }}
                              >
                                Delete
                              </Button>
                            </HStack>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ))
          ) : (
            <Text>Tidak ada data untuk ditampilkan.</Text>
          )}
        </Container>
      </Box>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent borderRadius={0} maxWidth="900px">
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>Apakah Anda yakin ingin menghapus item ini?</Text>
            <HStack mt={4}>
              <Button
                colorScheme="red"
                onClick={() => {
                  axios
                    .post(
                      `${
                        import.meta.env.VITE_REACT_APP_API_BASE_URL
                      }/kwitansi/delete/rincian-bpd`,
                      { id: itemToDelete.id }
                    )
                    .then(() => {
                      onDeleteClose();
                      fetchDataRampung();
                    })
                    .catch((err) => console.error(err));
                }}
              >
                Hapus
              </Button>
              <Button onClick={onDeleteClose}>Batal</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default Rampung;
