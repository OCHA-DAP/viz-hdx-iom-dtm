var Models = {
    getDataDTM: function getDataDTM() {
        url = 'https://proxy.hxlstandard.org/data/004c97/download/africa-dtm-baseline-assessments-topline.objects.json'
        $.getJSON(url, function (data) {
            var totalIdps = 0;
            var totalHH = 0;
            var countriesOld = [];
            var idpsHHByCountryArray = [];
            var countries = {};

            $.each(data, function (key, val) {
                totalIdps += val["#population+idps+ind"];
                totalHH += val["#population+hh+idps"];
                countriesOld.push(val["#country+name"]);

                if (!countries[val["#country+name"]]) {
                    countries[val["#country+name"]] = 0
                }
                countries[val["#country+name"]] += val["#population+idps+ind"]
            })

            
            //console.log(countries);
            for (var country in countries) {
                idpsHHByCountryArray.push({ country: country, idpsnumber: countries[country] })
            }

            $('#totalNumHH').text(Utility.abbreviateNumber(totalHH)).removeClass("spinner");
           $('#totalNumIDP').text(Utility.abbreviateNumber(totalIdps)).removeClass("spinner");

            var numOfCountries = new Set(countriesOld);

            $('#numOfCountries').text(numOfCountries.size).removeClass("spinner")

            idpsHHByCountryArray.sort(Utility.dynamicSort("idpsnumber"));

            objIndex = idpsHHByCountryArray.findIndex((obj => obj.country == 'Central African Republic'));            
            idpsHHByCountryArray[objIndex].country = 'CAR';

            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MDG52'));
            data[objIndex]["#adm1+code"] = "MG52";

            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI01'));
            data[objIndex]["#adm1+code"] = "ML01";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI02'));
            data[objIndex]["#adm1+code"] = "ML02";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI03'));
            data[objIndex]["#adm1+code"] = "ML03";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI04'));
            data[objIndex]["#adm1+code"] = "ML04";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI05'));
            data[objIndex]["#adm1+code"] = "ML05";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI06'));
            data[objIndex]["#adm1+code"] = "ML06";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI07'));
            data[objIndex]["#adm1+code"] = "ML07";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI08'));
            data[objIndex]["#adm1+code"] = "ML08";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI09'));
            data[objIndex]["#adm1+code"] = "ML09";

            //console.log(idpsHHByCountryArray);
            Charts.drawIDPsByCountryChart(idpsHHByCountryArray);
            //LeafLetMaps.drawMapDTM(data);
            Maps.drawMapDTM(data);

        }).fail(function () {
            console.log("error");
        });
    }
}