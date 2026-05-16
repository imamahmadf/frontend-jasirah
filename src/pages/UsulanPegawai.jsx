import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import { Link, useHistory } from "react-router-dom";
import Rill from "../Componets/Rill";
import { useDisclosure } from "@chakra-ui/react";
import Foto from "../assets/add_photo.png";

import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useFormik } from "formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import YupPassword from "yup-password";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  Heading,
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
  Select,
  Td,
  Flex,
  Textarea,
  Alert,
  Toast,
  Input,
  FormHelperText,
  Spacer,
  VStack,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../Redux/Reducers/auth";
import LayoutPegawai from "../Componets/Pegawai/LayoutPegawai";

function UsulanPegawai() {
  const [dataUsulan, setDataUsulan] = useState(null);
  const history = useHistory();
  async function fetchUsulan() {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get/usulan`)
      .then((res) => {
        // Tindakan setelah berhasil
        setDataUsulan(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  useEffect(() => {
    fetchUsulan();
  }, []);
  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          border={"1px"}
          borderRadius={"6px"}
          borderColor={"rgba(229, 231, 235, 1)"}
          maxW={"2880px"}
          bgColor={"white"}
          p={"30px"}
        >
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                <Th>nama</Th>
                <Th>Pangkat/golongan</Th>
                <Th>Unit Kerja</Th>
                <Th>Dokumen</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataUsulan?.map((item, index) => (
                <Tr key={index}>
                  <Td>{item?.pegawai.nama || "-"}</Td>
                  <Td>
                    {`${item?.pegawai.daftarPangkat.pangkat}/${item?.pegawai.daftarGolongan.golongan}`}
                  </Td>
                  <Td>{item?.pegawai.daftarUnitKerja.unitKerja}</Td>
                  <Td>
                    {item?.tujuan?.map((val, idx) => (
                      <Text key={idx}>{val || "-"}</Text>
                    ))}
                  </Td>
                  <Td>
                    <Button
                      onClick={() =>
                        history.push(
                          `/pegawai/detail-usulan/${item.pegawai.id}`
                        )
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

export default UsulanPegawai;
