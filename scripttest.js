var nodes = null;
        var edges = null;
        var network = null;

        function setDefaultLocale() {
            var defaultLocal = navigator.language;
            var select = document.getElementById("locale");
            select.selectedIndex = 0; // set fallback value
            for (var i = 0, j = select.options.length; i < j; ++i) {
              if (select.options[i].getAttribute("value") === defaultLocal) {
                select.selectedIndex = i;
                break;
              }
            }
          }

        var data = {
            nodes: [
                { id: 1, label: 'Nodo 1' },
                { id: 2, label: 'Nodo 2' },
                { id: 3, label: 'Nodo 3' }
            ],
            edges: [
                { from: 1, to: 2, label: 'Arista 1' },
                { from: 2, to: 3, label: 'Arista 2' }
            ]
        };

        function draw() {
            // Verifica si hay una instancia existente de la red y la destruye
            if (network !== null) {
                network.destroy();
            }
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
        // Funciones para editar nodos y aristas
        function editNode(data, cancelAction, callback) {
            document.getElementById("node-id").value = data.id || "";
            document.getElementById("node-label").value = data.label || "";
            document.getElementById("node-saveButton").onclick = function () {
                data.id = document.getElementById("node-id").value;
                data.label = document.getElementById("node-label").value;
                clearNodePopUp();
                callback(data);
            };
            document.getElementById("node-cancelButton").onclick = cancelAction.bind(this, callback);
            document.getElementById("node-popUp").style.display = "block";
        }

        function clearNodePopUp() {
            document.getElementById("node-popUp").style.display = "none";
        }

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
        }

        function cancelEdgeEdit(callback) {
            clearEdgePopUp();
            callback(null);
        }

        function clearEdgePopUp() {
            document.getElementById("edge-popUp").style.display = "none";
        }
        function init() {
            setDefaultLocale();
            draw();
            
          }
          
          window.addEventListener("load", () => {
            init();
          });