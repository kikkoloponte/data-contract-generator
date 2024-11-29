import React, { useState } from 'react';
import { Trash2, Plus, Copy, ChevronDown, ChevronUp, Tag } from 'lucide-react';

// Tipi per i campi del contratto dati
interface DataField {
  name: string;
  title?: string;
  description?: string;
  type: string;
  required: boolean;
  sensitive?: {
    pii?: boolean;
    phi?: boolean;
  };
  enumeration?: string[];
  constraints?: {
    [key: string]: string | number | boolean;
  };
}

// Tipi di dati supportati
const DATA_TYPES = [
  'string',
  'integer',
  'number',
  'boolean',
  'date',
  'timestamp',
  'array',
  'object',
];

// Componente principale per il generatore di contratti dati
const DataContractGenerator: React.FC = () => {
  const [contractName, setContractName] = useState('');
  const [domain, setDomain] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [dataProductName, setDataProductName] = useState('');
  const [fields, setFields] = useState<DataField[]>([]);
  const [yamlOutput, setYamlOutput] = useState('');
  const [expandedFields, setExpandedFields] = useState<{ [key: number]: boolean }>({});

  // Aggiunge un nuovo campo
  const addField = () => {
    const newIndex = fields.length;
    setFields([
      ...fields,
      {
        name: '',
        type: 'string',
        required: false,
        sensitive: {
          pii: false,
          phi: false,
        },
      } as DataField,
    ]);
    setExpandedFields({ ...expandedFields, [newIndex]: true });
  };

  // Rimuove un campo e aggiorna gli indici
  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);

    const newExpandedFields: { [key: number]: boolean } = {};
    Object.keys(expandedFields)
      .filter((key) => Number(key) !== index)
      .forEach((key) => {
        const newIndex = Number(key) > index ? Number(key) - 1 : Number(key);
        newExpandedFields[newIndex] = expandedFields[Number(key)];
      });
    setExpandedFields(newExpandedFields);
  };

  // Espandi o riduci un campo
  const toggleFieldExpansion = (index: number) => {
    setExpandedFields({
      ...expandedFields,
      [index]: !expandedFields[index],
    });
  };

  // Aggiorna un campo specifico
  const updateField = (index: number, updates: Partial<DataField>) => {
    const newFields = [...fields];
    const updatedField = { ...newFields[index], ...updates };

    // Controlla duplicati
    if (
      updates.name &&
      fields.some((field, idx) => idx !== index && field.name === updates.name)
    ) {
      alert('Il nome del campo deve essere unico!');
      return;
    }

    newFields[index] = updatedField;
    setFields(newFields);
  };

  // Aggiorna enumerazioni
  const updateEnumeration = (index: number, enumStr: string) => {
    const enumValues = enumStr
      .split(',')
      .map((val) => val.trim())
      .filter((val) => val);
    updateField(index, { enumeration: enumValues.length > 0 ? enumValues : undefined });
  };

  // Genera YAML
  const generateYAML = () => {
    const yamlLines: string[] = [];

    // Sezione Tags
    yamlLines.push('tags:');
    if (domain) yamlLines.push(`  domain: ${domain}`);
    if (subdomain) yamlLines.push(`  subdomain: ${subdomain}`);
    if (dataProductName) yamlLines.push(`  data_product_name: ${dataProductName}`);

    yamlLines.push(`name: ${contractName || 'MyDataContract'}`);

    yamlLines.push('fields:');
    fields.forEach((field) => {
      yamlLines.push(`  ${field.name}:`);
      if (field.title) yamlLines.push(`    title: "${field.title}"`);
      if (field.description) yamlLines.push(`    description: "${field.description}"`);
      yamlLines.push(`    type: ${field.type}`);
      yamlLines.push(`    required: ${field.required}`);
      if (field.sensitive) {
        yamlLines.push('    sensitive:');
        if (field.sensitive.pii) yamlLines.push('      pii: true');
        if (field.sensitive.phi) yamlLines.push('      phi: true');
      }
      if (field.enumeration) {
        yamlLines.push('    enumeration:');
        field.enumeration.forEach((value) => yamlLines.push(`      - ${value}`));
      }
      if (field.constraints) {
        yamlLines.push('    constraints:');
        Object.entries(field.constraints).forEach(([key, value]) =>
          yamlLines.push(`      ${key}: ${value}`)
        );
      }
    });

    setYamlOutput(yamlLines.join('\n'));
  };

  // Copia YAML
  const copyYAML = () => {
    navigator.clipboard.writeText(yamlOutput);
    alert('YAML copiato negli appunti!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Generatore di Data Contract YAML</h1>
      <div className="mb-4 bg-gray-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <Tag className="mr-2" /> Tags e Informazioni Data Product
        </h2>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4">
            <label className="block text-gray-700">Dominio</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-blue-500"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-gray-700">Sotto-dominio</label>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-blue-500"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-gray-700">Nome Data Product</label>
            <input
              type="text"
              value={dataProductName}
              onChange={(e) => setDataProductName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Nome del Contratto</label>
        <input
          type="text"
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-blue-500"
        />
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Campi</h2>
          <button
            onClick={addField}
            className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-600"
          >
            <Plus className="mr-2" /> Aggiungi Campo
          </button>
        </div>
        {fields.map((field, index) => (
          <div key={index} className="border p-4 rounded-md mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => toggleFieldExpansion(index)}
                  className="mr-3 text-gray-600 hover:text-gray-900"
                >
                  {expandedFields[index] ? <ChevronUp /> : <ChevronDown />}
                </button>
                <span className="font-semibold">{field.name || 'Nuovo Campo'}</span>
              </div>
              <button
                onClick={() => removeField(index)}
                className="text-red-500 hover:bg-red-100 p-2 rounded-md"
              >
                <Trash2 />
              </button>
            </div>
            {expandedFields[index] && (
              <div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label>Nome</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="w-full px-2 py-1 border rounded-md"
                    />
                  </div>
                  <div className="col-span-3">
                    <label>Titolo</label>
                    <input
                      type="text"
                      value={field.title || ''}
                      onChange={(e) =>
                        updateField(index, { title: e.target.value || undefined })
                      }
                      className="w-full px-2 py-1 border rounded-md"
                    />
                  </div>
                  <div className="col-span-3">
                    <label>Tipo</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="w-full px-2 py-1 border rounded-md"
                    >
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                    />
                    <label className="ml-2">Obbligatorio</label>
                  </div>
                </div>
                <div>
                  <label>Descrizione</label>
                  <textarea
                    value={field.description || ''}
                    onChange={(e) =>
                      updateField(index, { description: e.target.value || undefined })
                    }
                    className="w-full px-2 py-1 border rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mb-4">
        <button
          onClick={generateYAML}
          className="bg-green-500 text-white px-3 py-2 rounded-md mr-2 hover:bg-green-600"
        >
          Genera YAML
        </button>
        <button
          onClick={copyYAML}
          className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
        >
          <Copy className="mr-2" /> Copia YAML
        </button>
      </div>
      <div>
        <textarea
          readOnly
          value={yamlOutput}
          className="w-full px-2 py-1 border rounded-md h-40"
        />
      </div>
    </div>
  );
};

export default DataContractGenerator;
