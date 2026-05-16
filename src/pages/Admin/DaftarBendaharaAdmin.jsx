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
  Flex,
  Spacer,
  useDisclosure,
  Center,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
function DaftarBendaharaAdmin() {
  const [dataBendahara, setDataBendahara] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBendahara, setSelectedBendahara] = useState(0);
  const history = useHistory();
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);

  async function fetchDataBendahara() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/get/bendahara/${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`
      );
      setDataBendahara(res.data.result);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const hapusBendahara = (e) => {
    console.log(e);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/delete/bendahara/${e}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        fetchDataBendahara();
        onClose();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  useEffect(() => {
    console.log("useEffect dijalankan");
    fetchDataBendahara();
  }, []);

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Button
            mb={"30px"}
            variant={"primary"}
            onClick={() => {
              history.push("/admin/tambah-bendahara");
            }}
          >
            Tambah +
          </Button>
          {isLoading ? (
            <Loading />
          ) : (
            <Table variant={"primary"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Sumber Dana</Th>
                  <Th>Jabatan</Th>
                  <Th>Nama</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody bgColor={"secondary"}>
                {dataBendahara &&
                  dataBendahara.map((item, index) =>
                    item.bendaharas.map((b, idx) => (
                      <Tr key={`${index}-${idx}`}>
                        <Td>{index + 1}</Td>
                        <Td>{item.sumber}</Td>
                        <Td>{b.jabatan}</Td>
                        <Td>{b.pegawai_bendahara?.nama || "-"}</Td>
                        <Td>
                          <Flex gap={"20px"}>
                            <Button variant={"primary"}>Edit</Button>
                            <Button
                              variant={"cancle"}
                              onClick={() => {
                                setSelectedBendahara(b.id);
                                onOpen();
                              }}
                            >
                              Hapus
                            </Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  )}
              </Tbody>
            </Table>
          )}
        </Container>
      </Box>

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
              onClick={() => hapusBendahara(selectedBendahara)}
            >
              Ya, Hapus
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default DaftarBendaharaAdmin;
