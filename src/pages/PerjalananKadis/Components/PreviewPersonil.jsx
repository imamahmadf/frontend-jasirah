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
    <Container maxW="1280px" variant="primary" pt="30px" ps="0px" mb="30px">
      <HStack mb="20px">
        <Box bgColor="primary" width="30px" height="30px" borderRadius="4px" />
        <Heading color="primary" fontSize="28px" fontWeight="600">
          Data Personil
        </Heading>
      </HStack>
      <Box p="30px" style={{ overflowX: "auto" }}>
        <Table variant="primary">
          <Thead>
            <Tr>
              <Th>No</Th>
              <Th>Nama</Th>
              <Th>Pangkat/Golongan</Th>
              <Th>Tingkatan</Th>
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
                  <Td>
                    {pegawai?.value?.daftarPangkat?.pangkat || "-"}/
                    {pegawai?.value?.daftarGolongan?.golongan || "-"}
                  </Td>
                  <Td>{pegawai?.value?.daftarTingkatan?.tingkatan || "-"}</Td>
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
