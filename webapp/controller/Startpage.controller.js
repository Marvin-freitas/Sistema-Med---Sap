sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/base/strings/formatMessage"
], function (Controller, JSONModel, NumberFormat, formatMessage) {
	"use strict";

	return Controller.extend("med.controller.Startpage", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		
		onLoginPress: function () {
			var oUser = this.getView().byId("user").getValue();
			var oPwd = this.getView().byId("pwd").getValue();
		
			if (oUser && oPwd) {
				fetch("http://localhost:3000/api/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						email: oUser,
						password: oPwd
					})
				})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						sap.m.MessageToast.show("Login realizado com sucesso!");
						this.oRouter.navTo("main"); // Redireciona para a tela principal
					} else {
						sap.m.MessageToast.show(data.message || "Usuário ou senha inválidos.");
					}
				})
				.catch(error => {
					console.error("Erro:", error);
					sap.m.MessageToast.show("Erro ao conectar com o servidor.");
				});
			} else {
				sap.m.MessageToast.show("Por favor, preencha todos os campos.");
			}
		},

		onRegisterPress: function () {
			this.oRouter.navTo("register"); 
		}
	});
});
