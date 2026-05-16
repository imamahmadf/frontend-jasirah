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
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
function KinerjaPJPL() {
  const [dataKontrak, setDataKontrak] = useState(null);
  const history = useHistory();
  const user = useSelector(userRedux);
  const toast = useToast();
  const role = useSelector(selectRole);
  const [pegawaiId, setPegawaiId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  async function fetchDataKontrak() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/get/kontrak/${
          user[0].pegawaiId
        }`
      )
      .then((res) => {
        setDataKontrak(res.data.result);

        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const tambahPejabat = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/post/pejabat-verifikator`,
        {
          pegawaiId,
          unitKerjaId,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Data berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
        fetchDataPejabat();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data gagal ditambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };

  useEffect(() => {
    fetchDataKontrak();
  }, []);

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          {/* {JSON.stringify(user[0].pegawaiId)} */}
          <HStack gap={5} mb={"30px"}></HStack>{" "}
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Periode Kontrak</Th>

                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody bgColor={"secondary"}>
              {dataKontrak &&
                dataKontrak.map((item, index) => (
                  <Tr key={`${index}`}>
                    <Td>{index + 1}</Td>
                    <Td>
                      {item?.tanggalAwal && item?.tanggalAkhir
                        ? `${new Date(item?.tanggalAwal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )} - ${new Date(
                            item?.tanggalAkhir
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "-"}
                    </Td>

                    <Td>
                      <Button
                        onClick={() =>
                          history.push(`/kepegawaian/detail/kinerja/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default KinerjaPJPL;
