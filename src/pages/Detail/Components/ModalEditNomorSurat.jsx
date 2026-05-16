import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Divider,
  Text,
  Icon,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit3, FiCheckCircle, FiFileText } from "react-icons/fi";

function ModalEditNomorSurat({
  isOpen,
  onClose,
  detailPerjalanan,
  onSave,
  headerBg,
  isLoading,
}) {
  const [noSuratTugas, setNoSuratTugas] = React.useState("");
  const [noNotaDinas, setNoNotaDinas] = React.useState("");

  const [personilNomorSPD, setPersonilNomorSPD] = React.useState({});

  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (isOpen && detailPerjalanan) {
      setNoSuratTugas(detailPerjalanan.noSuratTugas || "");
      setNoNotaDinas(detailPerjalanan.noNotaDinas || "");

      const map = {};
      (detailPerjalanan.personils || []).forEach((p) => {
        map[p.id] = p.nomorSPD || "";
      });
      setPersonilNomorSPD(map);
    }
  }, [isOpen, detailPerjalanan]);

  const handlePersonilNomorSPDChange = (personilId, value) => {
    setPersonilNomorSPD((prev) => ({ ...prev, [personilId]: value }));
  };

  const handleSubmit = () => {
    const updates = {
      noSuratTugas: noSuratTugas.trim() || null,
      noNotaDinas: noNotaDinas.trim() || null,
      personilNomorSPD: Object.entries(personilNomorSPD).map(
        ([personilId, nomorSPD]) => ({
          personilId: Number(personilId),
          nomorSPD: (nomorSPD || "").trim() || null,
        }),
      ),
    };
    onSave(updates);
  };

  const personils = detailPerjalanan?.personils || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxWidth="560px" mx={4}>
        <ModalHeader
          bg={headerBg}
          borderTopRadius="xl"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiEdit3} color="purple.500" />
          Edit Nomor Surat
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                No. Surat Tugas
              </FormLabel>
              <Input
                value={noSuratTugas}
                onChange={(e) => setNoSuratTugas(e.target.value)}
                placeholder="Nomor surat tugas"
                border="2px"
                borderColor={borderColor}
                borderRadius="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                No. Nota Dinas/Telaahan Staff
              </FormLabel>
              <Input
                value={noNotaDinas}
                onChange={(e) => setNoNotaDinas(e.target.value)}
                placeholder="Nomor nota dinas"
                border="2px"
                borderColor={borderColor}
                borderRadius="lg"
              />
            </FormControl>

            <Divider />

            <Box>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.600"
                mb={3}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiFileText} />
                Nomor SPD (per personil)
              </Text>
              <VStack spacing={3} align="stretch">
                {personils.map((p) => (
                  <FormControl key={p.id}>
                    <FormLabel fontSize="xs" color="gray.500">
                      {p.pegawai?.nama}
                    </FormLabel>
                    <Input
                      value={personilNomorSPD[p.id] ?? ""}
                      onChange={(e) =>
                        handlePersonilNomorSPDChange(p.id, e.target.value)
                      }
                      placeholder="Nomor SPD"
                      size="sm"
                      border="2px"
                      borderColor={borderColor}
                      borderRadius="lg"
                    />
                  </FormControl>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} p={6}>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={isLoading}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Batal
          </Button>
          <Button
            colorScheme="purple"
            leftIcon={<FiCheckCircle />}
            onClick={handleSubmit}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            isLoading={isLoading}
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalEditNomorSurat;
