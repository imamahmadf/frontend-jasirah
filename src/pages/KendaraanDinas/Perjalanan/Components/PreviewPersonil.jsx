import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  HStack,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";

const PreviewPersonil = () => {
  const { values } = useFormikContext();
  const selectedPegawai = values.personil || [];

  return (
    <Container maxW="1280px" variant="primary" pt="30px" ps="0px" my="20px">
      <HStack>
        <Box bgColor="primary" width="30px" height="30px" />
        <Heading color="primary">Data Personil</Heading>
      </HStack>
      <Box p="30px">
        <Table variant="primary">
          <Thead>
            <Tr>
              <Th>No</Th>
              <Th>Nama</Th>
              <Th>Pangkat/Golongan</Th>
              <Th>Jabatan</Th>
              <Th>NIP</Th>
            </Tr>
          </Thead>
          <Tbody>
            {selectedPegawai
              .filter((p) => p) // hanya tampilkan jika tidak null
              .map((pegawai, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{pegawai?.value?.nama || "-"}</Td>
                  <Td>{pegawai?.value?.daftarPangkat?.pangkat || "-"}</Td>
                  <Td>{pegawai?.value?.jabatan || "-"}</Td>
                  <Td>{pegawai?.value?.nip || "-"}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

export default PreviewPersonil;
