sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("med.controller.Register", {
        onRegisterSubmit: function () {
            var oView = this.getView();
            var name = oView.byId("name").getValue();
            var email = oView.byId("email").getValue();
            var password = oView.byId("password").getValue();
        
            if (name && email && password) {
                fetch("http://localhost:3000/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                })
                .then(response => response.json())
                .then(data => {
                   
                    MessageToast.show(data.message || "Cadastro realizado!");
        
          
                    if (data.message === "Cadastro realizado com sucesso!") {
                        this.getOwnerComponent().getRouter().navTo("startpage");
                    }
                })
                .catch(error => {
                    console.error("Erro:", error);
                    MessageToast.show("Erro ao conectar com o servidor.");
                });
            } else {
                MessageToast.show("Por favor, preencha todos os campos.");
            }
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("startpage");
        }
    });
});
