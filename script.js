// Define las variables globales para los nodos, aristas y la red
var nodes = null;
var edges = null;
var network = null;

// Define el objeto de datos para la red de grafos
var data = {
    nodes: [],
    edges: []
};

// Función para dibujar la red de grafos
function draw() {
    // Obtener el contenedor donde se dibujará la red
    var container = document.getElementById("mynetwork");

    // Opciones de configuración de la red de grafos
    var options = {
        // Configuración de la manipulación de nodos y aristas
        manipulation: {
            // Configuración de la manipulación de nodos y aristas
            addNode: function (data, callback) {
                document.getElementById("node-operation").innerText = "Agregar Nodo";
                editNode(data, clearNodePopUp, callback);
            },
            editNode: function (data, callback) {
                document.getElementById("node-operation").innerText = "Editar Nodo";
                editNode(data, cancelNodeEdit, callback);
            },
            addEdge: function (data, callback) {
                document.getElementById("edge-operation").innerText = "Agregar Arista";
                editEdgeWithoutDrag(data, callback);
            },
            editEdge: {
                editWithoutDrag: function (data, callback) {
                    document.getElementById("edge-operation").innerText = "Editar Arista";
                    editEdgeWithoutDrag(data, callback);
                },
            },
        }
    };

    // Crear una nueva instancia de la red de grafos
    network = new vis.Network(container, data, options);
}

// Función para agregar o editar un nodo
function editNode(data, cancelAction, callback) {
    document.getElementById("node-id").value = data.id || "";
    document.getElementById("node-label").value = data.label || "";
    document.getElementById("node-saveButton").onclick = function () {
        data.id = document.getElementById("node-id").value;
        data.label = document.getElementById("node-label").value;
        clearNodePopUp();
        console.log("Contenido de data antes de agregar el nodo:", data); // Agregar esta línea
        callback(data);
        updateMatrices(); // Llamar a la función para actualizar las matrices después de agregar el nodo
        updateData(); // Actualizar el objeto data después de guardar los cambios en el nodo
    };
    document.getElementById("node-cancelButton").onclick = cancelAction.bind(this, callback);
    document.getElementById("node-popUp").style.display = "block";
}


// Función para limpiar el pop-up de nodo
function clearNodePopUp() {
    document.getElementById("node-popUp").style.display = "none";
}

// Función para cancelar la edición de un nodo
function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}

function editEdgeWithoutDrag(data, callback) {
    document.getElementById("edge-label").value = data.label || "";
    var edgeTypeSelect = document.getElementById("edge-type");
    edgeTypeSelect.value = data.type || "uni";
    document.getElementById("edge-saveButton").onclick = function () {
        data.label = document.getElementById("edge-label").value;
        data.type = edgeTypeSelect.value;
        saveEdgeData(data, callback);
    };
    document.getElementById("edge-cancelButton").onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById("edge-popUp").style.display = "block";
}

function saveEdgeData(data, callback) {
    data.label = document.getElementById("edge-label").value;
    if (data.type === "uni") {
        data.arrows = "to";
    } else {
        data.arrows = undefined;
    }
    clearEdgePopUp();
    callback(data);
    updateData();
}

function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}

function clearEdgePopUp() {
    document.getElementById("edge-popUp").style.display = "none";
}

// Función para eliminar un nodo
function deleteNode(data, nodeId) {
    // Filtrar los nodos para eliminar el nodo con el ID especificado
    data.nodes = data.nodes.filter(node => node.id !== nodeId);

    // Filtrar las aristas para eliminar las aristas que conectan con el nodo eliminado
    data.edges = data.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);

    // Actualizar las matrices después de eliminar el nodo
    updateData(); // Actualizar los datos después de eliminar el nodo
}

// Función para eliminar una arista
function deleteEdge(data, edgeId) {
    // Filtrar las aristas para eliminar la arista con el ID especificado
    data.edges = data.edges.filter(edge => edge.id !== edgeId);

    // Actualizar las matrices después de eliminar la arista
    updateData(); // Actualizar los datos después de eliminar la arista
}

// Agregar eventos de clic a los botones para mostrar las matrices de adyacencia e incidencia
document.getElementById('btnMostrarAdyacencia').addEventListener('click', function () {
    console.log("Botón de mostrar adyacencia clickeado.");
    mostrarMatriz(generarMatrizAdyacencia(data), 'matricesContainer');
});

document.getElementById('btnMostrarIncidencia').addEventListener('click', function () {
    console.log("Botón de mostrar incidencia clickeado.");
    mostrarMatriz(generarMatrizIncidencia(data), 'matricesContainer');
});

// Función para generar la matriz de adyacencia
function generarMatrizAdyacencia(data) {
    const nodes = data.nodes.map(node => ({ id: node.id, label: node.label }));
    const numNodos = nodes.length;
    
    // Inicializar la matriz con ceros en lugar de valores negativos
    const matrizAdyacencia = new Array(numNodos + 1).fill(null).map(() => new Array(numNodos + 1).fill(0));

    // Llenar la primera fila y columna con los labels de los nodos
    nodes.forEach((node, index) => {
        matrizAdyacencia[0][index + 1] = node.label; // Labels de nodos en la primera fila
        matrizAdyacencia[index + 1][0] = node.label; // Labels de nodos en la primera columna
    });

    // Llenar el resto de la matriz con 1 si hay una arista entre los nodos correspondientes
    data.edges.forEach(edge => {
        const fromIndex = nodes.findIndex(node => node.id === edge.from);
        const toIndex = nodes.findIndex(node => node.id === edge.to);
        if (fromIndex !== -1 && toIndex !== -1) {
            matrizAdyacencia[fromIndex + 1][toIndex + 1] = 1;
            matrizAdyacencia[toIndex + 1][fromIndex + 1] = 1; // Si el grafo es no dirigido
        }
    });

    return matrizAdyacencia;
}

// Función para generar la matriz de incidencia
function generarMatrizIncidencia(data) {
    const nodes = data.nodes.map(node => ({ id: node.id, label: node.label }));
    const edges = data.edges.map((edge, index) => ({ id: `Edge_${index + 1}`, label: edge.label || '' }));
    const numNodos = nodes.length;
    const numAristas = edges.length;
    
    // Inicializar la matriz con ceros en lugar de valores negativos
    const matrizIncidencia = new Array(numNodos + 1).fill(0).map(() => new Array(numAristas + 1).fill(0));

    // Llenar la primera fila con los labels de las aristas
    edges.forEach((edge, index) => {
        matrizIncidencia[0][index + 1] = edge.label;
    });

    // Llenar la primera columna con los labels de los nodos
    nodes.forEach((node, index) => {
        matrizIncidencia[index + 1][0] = node.label;
    });

    // Llenar el resto de la matriz con los valores de incidencia
    data.edges.forEach((edge, index) => {
        const fromIndex = nodes.findIndex(node => node.id === edge.from);
        const toIndex = nodes.findIndex(node => node.id === edge.to);
        if (fromIndex !== -1 && toIndex !== -1) {
            if (edge.type === 'uni') {
                matrizIncidencia[toIndex + 1][index + 1] = edge.label || 0;
            } else {
                matrizIncidencia[fromIndex + 1][index + 1] = edge.label || 0;
                matrizIncidencia[toIndex + 1][index + 1] = edge.label || 0;
            }
        }
    });

    return matrizIncidencia;
}



// Función para mostrar la matriz en la página web
function mostrarMatriz(matriz, contenedor) {
    const tabla = document.createElement('table');
    matriz.forEach((fila) => {
        const tr = document.createElement('tr');
        fila.forEach((valor) => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });
        tabla.appendChild(tr);
    });
    document.getElementById(contenedor).innerHTML = '';
    document.getElementById(contenedor).appendChild(tabla);
    
}

// Función para actualizar las matrices
function updateMatrices() {
    // Generar las nuevas matrices de adyacencia e incidencia con los datos actualizados
    const nuevaMatrizAdyacencia = generarMatrizAdyacencia(data);
    const nuevaMatrizIncidencia = generarMatrizIncidencia(data);

    // Mostrar las nuevas matrices en la interfaz
    mostrarMatriz(nuevaMatrizAdyacencia, 'matrizAdyacenciaContainer');
    mostrarMatriz(nuevaMatrizIncidencia, 'matrizIncidenciaContainer');
}

function updateData() {
    // Obtener los nodos y aristas de la red de grafos
    var updatedNodes = network.body.data.nodes.get();
    var updatedEdges = network.body.data.edges.get();
    
    // Actualizar el objeto data con los nodos y aristas actualizados
    if (updatedNodes && updatedNodes.length > 0) {
        data.nodes = updatedNodes;
    }
    if (updatedEdges && updatedEdges.length > 0) {
        data.edges = updatedEdges;
    }

    // Actualizar las matrices después de actualizar los datos
    updateMatrices();
}

// Inicializar la aplicación al cargar la página
window.addEventListener("load", function () {
    draw();
});

function dijkstra(startNode, endNode) {
    // Inicializar el conjunto de nodos no visitados y la distancia a cada nodo
    let unvisitedNodes = new Set(data.nodes.map(node => node.id));
    let distances = {};
    data.nodes.forEach(node => {
        distances[node.id] = Infinity;
    });
    distances[startNode] = 0;

    // Mientras haya nodos no visitados
    while (unvisitedNodes.size > 0) {
        // Encontrar el nodo no visitado con la distancia más corta
        let currentNode = Array.from(unvisitedNodes).reduce((a, b) => distances[a] < distances[b] ? a : b);

        // Si el nodo actual es el nodo final, terminar el algoritmo
        if (currentNode === endNode) {
            break;
        }

        // Marcar el nodo actual como visitado
        unvisitedNodes.delete(currentNode);

        // Actualizar las distancias de los nodos adyacentes
        data.edges.forEach(edge => {
            if (edge.from === currentNode && unvisitedNodes.has(edge.to)) {
                let newDistance = distances[currentNode] + data.edges.label;
                if (newDistance < distances[data.edge.to]) {
                    distances[data.edge.to] = newDistance;
                }
            }
        });
    }

    return distances;
}

function mostrarResultadosDijkstra(startNode, endNode) {
    // Ejecutar el algoritmo de Dijkstra
    let resultados = dijkstra(startNode, endNode);

    // Crear la tabla para mostrar los resultados
    let tabla = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    // Crear la fila de encabezado
    let trEncabezado = document.createElement('tr');
    let thNodo = document.createElement('th');
    thNodo.textContent = 'Nodo';
    let thDistancia = document.createElement('th');
    thDistancia.textContent = 'Distancia';
    trEncabezado.appendChild(thNodo);
    trEncabezado.appendChild(thDistancia);
    thead.appendChild(trEncabezado);

    // Crear las filas de los resultados
    for (let nodo in resultados) {
        let tr = document.createElement('tr');
        let tdNodo = document.createElement('td');
        tdNodo.textContent = nodo;
        let tdDistancia = document.createElement('td');
        tdDistancia.textContent = resultados[nodo];
        tr.appendChild(tdNodo);
        tr.appendChild(tdDistancia);
        tbody.appendChild(tr);
    }

    // Añadir la tabla al contenedor
    tabla.appendChild(thead);
    tabla.appendChild(tbody);
    document.getElementById('resultadosDijkstra').innerHTML = '';
    document.getElementById('resultadosDijkstra').appendChild(tabla);
}

document.getElementById('btnMostrarDijkstra').addEventListener('click', function () {
    // Aquí puedes especificar los nodos de inicio y final
    let startNode = data.nodes[0]; // Reemplazar con el ID del nodo de inicio
    let endNode = 'nodoFinal'; // Reemplazar con el ID del nodo final
    mostrarResultadosDijkstra(startNode, endNode);
    
});

function actualizarMenusConNodos() {
    // Limpiar los menús desplegables
    let selectInicio = document.getElementById('nodoInicio');
    let selectFinal = document.getElementById('nodoFinal');
    selectInicio.innerHTML = '';
    selectFinal.innerHTML = '';

    // Llenar los menús desplegables con los nodos actuales
    data.nodes.forEach(nodo => {
        let optionInicio = document.createElement('option');
        optionInicio.value = nodo.id;
        optionInicio.textContent = nodo.label;
        selectInicio.appendChild(optionInicio);

        let optionFinal = document.createElement('option');
        optionFinal.value = nodo.id;
        optionFinal.textContent = nodo.label;
        selectFinal.appendChild(optionFinal);
    });
}


