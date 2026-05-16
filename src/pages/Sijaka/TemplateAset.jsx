import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  VStack,
  useToast,
  FormLabel,
  Select,
  Container,
  Thead,
  Table,
  Tr,
  Th,
  Td,
  Tbody,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

import LayoutAset from "../../Componets/Aset/LayoutAset";
const TemplateAset = () => {
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataTemplate, setDataTemplate] = useState([]);
  const [oldFile, setOldFile] = useState("");
  const [templateId, setTemplateId] = useState(null);
  const toast = useToast();

  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/download`,
        {
          params: { fileName },

          responseType: "blob",
        }
      );

      // Membuat URL untuk file yang akan diunduh
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat mengunduh file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  async function fetchTemplate() {
    await axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get-aset`)
      .then((res) => {
        console.log(res.data.result);
        setDataTemplate(res.data.result);
        if (res.data.result && res.data.result.length > 0) {
          setOldFile(res.data.result[0].dokumen);
          setTemplateId(res.data.result[0].id);
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  const validationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required("File harus diunggah")
      .test(
        "fileType",
        "Format file tidak valid. Harap unggah file .docx",
        (value) =>
          value &&
          value.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ),
  });

  useEffect(() => {
    fetchTemplate();
  }, []);
  return (
    <LayoutAset>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"90vh"}>
        <Container variant={"primary"} p={"30px"} my={"30px"} minW={"1000px"}>
          <Box
            mx="auto"
            mt={10}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="lg"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Upload Template Word
            </Text>

            <Formik
              initialValues={{ file: null, nomorSurat: null }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const formData = new FormData();
                formData.append("file", values.file);
                formData.append("nomorSurat", values.nomorSurat);
                formData.append("oldFile", oldFile || "");
                formData.append("id", templateId || "");

                try {
                  const response = await axios.post(
                    `${
                      import.meta.env.VITE_REACT_APP_API_BASE_URL
                    }/template/upload-aset`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  );

                  toast({
                    title: "Sukses!",
                    description: response.data.message,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });

                  resetForm();
                  setSelectedFile(null);
                  fetchTemplate();
                } catch (error) {
                  toast({
                    title: "Gagal Mengunggah",
                    description: "Terjadi kesalahan saat mengunggah file",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }

                setSubmitting(false);
              }}
            >
              {({ setFieldValue, isSubmitting, errors, touched }) => (
                <Form>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Nomor Surat</FormLabel>
                      <Input
                        type="text"
                        onChange={(event) => {
                          setFieldValue("nomorSurat", event.target.value);
                        }}
                      />
                      <FormErrorMessage>{errors.jenis}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.file && touched.file}>
                      <Input
                        type="file"
                        accept=".docx"
                        onChange={(event) => {
                          setFieldValue("file", event.currentTarget.files[0]);
                          setSelectedFile(event.currentTarget.files[0]);
                        }}
                        p={1}
                      />
                      <FormErrorMessage>{errors.file}</FormErrorMessage>
                    </FormControl>

                    {selectedFile && (
                      <Text fontSize="sm" color="gray.600">
                        File: {selectedFile.name}
                      </Text>
                    )}

                    <Button
                      type="submit"
                      variant={"primary"}
                      isLoading={isSubmitting}
                      isDisabled={!selectedFile}
                    >
                      Upload
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
          </Box>

          <Box mt={"30px"}>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>Nomor Surat</Th>
                  <Th>Surat Pengantar</Th>
                </Tr>
              </Thead>
              <Tr>
                <Td>{dataTemplate[0]?.nomorSurat}</Td>
                <Td>
                  {dataTemplate[0]?.dokumen ? (
                    <Button
                      variant={"primary"}
                      onClick={() => handleDownload(dataTemplate[0]?.dokumen)}
                    >
                      lihat
                    </Button>
                  ) : (
                    "-"
                  )}
                </Td>
              </Tr>
            </Table>
          </Box>
        </Container>
      </Box>
    </LayoutAset>
  );
};

export default TemplateAset;
