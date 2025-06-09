sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat" // Added DateFormat dependency
], function (Controller, JSONModel, DateFormat) { // Added DateFormat to the function arguments
    "use strict";

    return Controller.extend("med.controller.Detalhe", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detalhe").attachPatternMatched(this._onRouteMatched, this);

            this.oRouter = this.getOwnerComponent().getRouter();
        },

        _onRouteMatched: function (oEvent) {
            var sId = oEvent.getParameter("arguments").id;
            this.pacienteId = sId;

            fetch("http://localhost:3000/api/pacientes/" + sId)
                .then(res => res.json())
                .then(data => {
                    var oModel = new JSONModel(data);
                    this.getView().setModel(oModel, "pacientes");
                    this.getView().bindElement("pacientes>/");
                });

            this._carregarConsultas(sId);
        },

        _carregarConsultas: function (pacienteId) {
            fetch("http://localhost:3000/api/consultas/" + pacienteId)
                .then(res => res.json())
                .then(data => {
                    var oConsultasModel = new JSONModel({ consultas: data });
                    this.getView().setModel(oConsultasModel, "consultasModel");
                });
        },

        onAgendarConsulta: function () {
            var oView = this.getView();
            var data = oView.byId("dataConsulta").getDateValue();
            var hora = oView.byId("horaConsulta").getValue();
            var descricao = oView.byId("descricaoConsulta").getValue();
            var medico = oView.byId("medicoConsulta").getValue();

            if (!data || !hora || !descricao || !medico) {
                sap.m.MessageToast.show("Preencha todos os campos.");
                return;
            }

            fetch("http://localhost:3000/api/consultas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paciente_id: this.pacienteId,
                    data: data.toISOString().split("T")[0],
                    hora: hora,
                    descricao: descricao,
                    medico: medico
                })
            })
            .then(res => res.json())
            .then(() => {
                sap.m.MessageToast.show("Consulta agendada!");
                oView.byId("dataConsulta").setDateValue(null);
                oView.byId("horaConsulta").setValue("");
                oView.byId("descricaoConsulta").setValue("");
                oView.byId("medicoConsulta").setValue("");
                this._carregarConsultas(this.pacienteId);
            })
            .catch(() => {
                sap.m.MessageToast.show("Erro ao agendar.");
            });
        },

        onNavBack: function () {
            this.oRouter.navTo("main");
        },

        onConsultaPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("consultasModel");
            const oData = oContext.getObject();

            
            const dataFormatada = this.formatDate(oData.data); 

            const oDialog = new sap.m.Dialog({
                title: "Detalhes da Consulta",
                content: [
                    new sap.m.VBox({ 
                        items: [
                            new sap.m.Text({ text: `Data: ${dataFormatada}` }),
                            new sap.m.Text({ text: `Descrição: ${oData.descricao}` })
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "Editar",
                    press: () => {
                        oDialog.close();
                        this.onEditarConsulta(oData);
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Excluir",
                    type: "Reject",
                    press: () => {
                        this._excluirConsulta(oData.id); 
                        oDialog.close();
                    }
                }),
                afterClose: () => oDialog.destroy()
            });

            oDialog.open();
        },

        onEditarConsulta: function (oData) {
            const oDialog = new sap.m.Dialog({
                title: "Editar Consulta",
                contentWidth: "500px",
                content: [
                    new sap.ui.layout.form.SimpleForm({
                        layout: "ResponsiveGridLayout",
                        labelSpanL: 4,
                        labelSpanM: 4,
                        emptySpanL: 2,
                        emptySpanM: 2,
                        columnsL: 1,
                        columnsM: 1,
                        content: [
                            new sap.m.Label({ text: "Data" }),
                            new sap.m.DatePicker("editData", {
                                dateValue: new Date(oData.data),
                                width: "100%"
                            }),
                            new sap.m.Label({ text: "Hora" }),
                            new sap.m.TimePicker("editHora", {
                                value: oData.hora,
                                width: "100%"
                            }),
                            new sap.m.Label({ text: "Médico" }),
                            new sap.m.Input("editMedico", {
                                value: oData.medico,
                                width: "100%"
                            }),
                            new sap.m.Label({ text: "Descrição" }),
                            new sap.m.TextArea("editDescricao", {
                                value: oData.descricao,
                                width: "100%",
                                rows: 4
                            })
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "Salvar",
                    type: "Emphasized",
                    press: () => {
                        const novaData = sap.ui.getCore().byId("editData").getDateValue();
                        const novaHora = sap.ui.getCore().byId("editHora").getValue();
                        const novoMedico = sap.ui.getCore().byId("editMedico").getValue();
                        const novaDescricao = sap.ui.getCore().byId("editDescricao").getValue();

                        fetch("http://localhost:3000/api/consultas/" + oData.id, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                data: novaData.toISOString().split("T")[0],
                                hora: novaHora,
                                medico: novoMedico,
                                descricao: novaDescricao
                            })
                        }).then(() => {
                            sap.m.MessageToast.show("Consulta atualizada.");
                            this._carregarConsultas(this.pacienteId);
                            oDialog.close();
                        });
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancelar",
                    press: () => oDialog.close()
                }),
                afterClose: () => oDialog.destroy()
            });

            oDialog.open();
        },

        _excluirConsulta: function (consultaId) { // Renamed to match the call in onConsultaPress
            fetch("http://localhost:3000/api/consultas/" + consultaId, {
                method: "DELETE"
            })
            .then(() => {
                sap.m.MessageToast.show("Consulta excluída.");
                this._carregarConsultas(this.pacienteId);
            })
            .catch(() => {
                sap.m.MessageToast.show("Erro ao excluir consulta.");
            });
        },

        /**
         * Formatter function to format the date from ISO 8601 to a more readable format.
         * @param {string} sDate The date string in ISO 8601 format.
         * @returns {string} The formatted date string.
         */
        formatDate: function (sDate) {
            if (sDate) {
                // Parse the ISO 8601 string into a Date object
                const oDate = new Date(sDate);

                // Define the desired date format for Brazilian Portuguese (DD/MM/YYYY)
                const oDateFormat = DateFormat.getDateInstance({
                    pattern: "dd/MM/yyyy"
                });

                // Format the date
                return oDateFormat.format(oDate);
            }
            return ""; // Return empty string if date is null or undefined
        }
    });
});