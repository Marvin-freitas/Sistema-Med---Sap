sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Popover, Button, VBox, JSONModel) {
    "use strict";

    return Controller.extend("med.controller.Main", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this._carregarPacientes();
        },

        _carregarPacientes: function () {
            fetch("http://localhost:3000/api/pacientes")
                .then(response => response.json())
                .then(data => {
                    var oPacientesModel = new JSONModel(data);
                    this.getView().setModel(oPacientesModel);
                    console.log("Pacientes carregados:", data);
                })
                .catch(() => {
                    MessageToast.show("Erro ao carregar pacientes");
                });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        onSearch: function (oEvent) {
        },

        onGo: function () {
            // Em branco por enquanto
        },

        onAddPaciente: function () {
            if (!this.byId("addPacienteDialog")) {
                this.getView().addDependent(this.byId("addPacienteDialog"));
            }
            this.byId("addPacienteDialog").open();
        },

        onCancelarDialog: function () {
            this.byId("addPacienteDialog").close();
        },

        onDialogClose: function () {
            this.byId("inputNome").setValue("");
            this.byId("inputIdade").setValue("");
            this.byId("inputTelefone").setValue("");
        },

        onSalvarPaciente: function () {
            var oNome = this.byId("inputNome").getValue();
            var oIdade = this.byId("inputIdade").getValue();
            var oTelefone = this.byId("inputTelefone").getValue();

            var oData = {
                nome: oNome,
                idade: parseInt(oIdade, 10),
                telefone: oTelefone
            };

            fetch("http://localhost:3000/api/pacientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erro ao salvar paciente.");
                    }
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Paciente adicionado com sucesso!");
                    this.byId("addPacienteDialog").close();
                    this._carregarPacientes(); // Atualiza lista
                })
                .catch(err => {
                    sap.m.MessageBox.error("Erro: " + err.message);
                });
        },

        onPressPaciente: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            var sId = oCtx.getProperty("id");

            if (sId) {
                this.oRouter.navTo("detalhe", { id: sId });
            } else {
                MessageToast.show("ID do paciente não encontrado.");
            }
        },

        onAvatarPress: function (oEvent) {
            var oButton = oEvent.getSource();

            if (!this._oPopover) {
                this._oPopover = new Popover({
                    showHeader: false,
                    placement: "Bottom",
                    content: new VBox({
                        items: [
                            new Button({
                                text: "Settings",
                                icon: "sap-icon://action-settings",
                                type: "Transparent",
                                press: this.onSettingsPress.bind(this)
                            }),
                            new Button({
                                text: "Logout",
                                icon: "sap-icon://log",
                                type: "Transparent",
                                press: this.onLogoutPress.bind(this)
                            })
                        ]
                    })
                });
            }

            this._oPopover.openBy(oButton);
        },

        onSettingsPress: function () {
            MessageToast.show("Settings Pressed!");
        },

        onLogoutPress: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        onRemoverPaciente: function (oEvent) {
            var oItem = oEvent.getSource().getParent(); // pega o ColumnListItem
            var oCtx = oItem.getBindingContext();
            var sId = oCtx.getProperty("id");
        
            if (!sId) {
                MessageToast.show("ID do paciente não encontrado.");
                return;
            }
        
            // Confirmação antes de excluir
            sap.m.MessageBox.confirm("Deseja realmente remover este paciente?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        fetch("http://localhost:3000/api/pacientes/" + sId, {
                            method: "DELETE"
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Erro ao deletar paciente.");
                            }
                            return response.json();
                        })
                        .then(() => {
                            MessageToast.show("Paciente removido com sucesso!");
                            fetch("http://localhost:3000/api/pacientes")
                                .then(res => res.json())
                                .then(function(updatedData) {
                                    this.getView().setModel(new JSONModel(updatedData));
                                }.bind(this)); // <- Aqui está o ponto chave
                        })
                        .catch(err => {
                            sap.m.MessageBox.error("Erro: " + err.message);
                        });
                    }
                }.bind(this)
            });
        }
    });
});
