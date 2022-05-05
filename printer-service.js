(
    function() {
        "use strict";
        // LOCATION
        const fs = require('fs');
        let dataFile = require('c:\\parking.json');
        const company = dataFile.company;

        // ESCPOS
        let escpos = require('escpos');
        escpos.USB = require('escpos-usb');
        // TM82:[0x04b8, 0x0202] TM82X[0x04b8, 0x0E27]
        let device  = new escpos.USB();

        const options = { encoding: "GB18030" /* default */ }
 
        const printer = new escpos.Printer(device, options);
        // BASE SETUP
        // =============================================================================

        // call the packages we need
        var cors = require('cors');
        var express    = require('express');        // call express
        var app        = express();                 // define our app using express
        var bodyParser = require('body-parser');

        // configure app to use bodyParser()
        // this will let us get the data from a POST
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(cors());

        var port = process.env.PORT || 8000;        // set our port

        // ROUTES FOR OUR API
        // =============================================================================
        var router = express.Router();              // get an instance of the express Router

        // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
        router.get('/', function(req, res) {
            res.json({ service: 'ok' });   
        });

        // more routes for our API will happen here
        router.route('/print')
            .post(function(req, res) {
                var kd_trx_parkir = req.body.kd_trx_parkir;
                var kendaraan = req.body.kendaraan;
                var gate = 'Gate-1';
                var tanggal = req.body.tanggal;
                var jam = req.body.jam;

                if( kendaraan != 'bus'){
                    printStruk(kd_trx_parkir, kendaraan, gate, tanggal, jam);
                } else {
                    printStrukBus(kd_trx_parkir, kendaraan, gate, tanggal, jam);
                }


                var x = {}
                x['kd_trx_parkir'] = kd_trx_parkir;
                x['kendaraan'] = kendaraan;
                x['tanggal'] = tanggal;
                x['jam'] = jam;

                res.json(x);
            })

        router.route('/printreport')
            .post(function(req, res){
                
                var tanggal = req.body.tanggal;
                var jumlah_motor = req.body.jumlah_motor;
                var pendapatan_motor = req.body.pendapatan_motor;
                var jumlah_mobil = req.body.jumlah_mobil;
                var pendapatan_mobil = req.body.pendapatan_mobil;
                var jumlah_elf = req.body.jumlah_elf;
                var pendapatan_elf = req.body.pendapatan_elf;
                var jumlah_bus = req.body.jumlah_bus;
                var pendapatan_bus = req.body.pendapatan_bus;
                var summary = req.body.summary;

                printReport(tanggal, jumlah_motor, pendapatan_motor, jumlah_mobil, pendapatan_mobil, jumlah_elf, pendapatan_elf, jumlah_bus, pendapatan_bus, summary);
                
                var x = {}
                x['cetak'] = 'report';
                x['tanggal'] = tanggal;

                res.json(x);
            })
        
        router.route('/print-laporan-kasir')
            .post(function(req, res){
                printLaporanKasir(req);
                res.json(req.body);
            });

        router.route('/print-struk-topup')
            .post(function(req, res){
                printStrukTopup(req);
                res.json(req.body);
            });

        router.route('/testprint')
            .get(function(req, res){

                testprint();

                var x = {}
                x['test'] = 'printer';

                res.json(x);
            })

        // REGISTER OUR ROUTES -------------------------------
        // all of our routes will be prefixed with /api
        app.use('/api', router);

        // START THE SERVER
        // =============================================================================
        app.listen(port);
        console.log('Magic happens on port ' + port);


        //==============================================================================
        switch(company){
            case "ma":
                var location = 'MUSEUM ANGKUT';
                var address = 'Jl. Terusan Sultan Agung No.2, Kota Batu';
                break;

            case "jtp2":
                var location = 'JATIM PARK 2';
                var address = 'Jl. Oro-Oro Ombo No.9, Kota Batu';
                break;

            case "pfp":
                var location = 'PREDATOR FUN PARK';
                var address = 'Jl. Raya Tlekung No.315, Kota Batu';
                break;

            case "bns":
                var location = 'BATU NIGHT SPECTACULAR';
                var address = 'Jl. Hayam Wuruk No.1, Kota Batu';
                break;
        }


        var liner = '--------------------------------';
        var linerReport = '----------------------------------------';
        var linercut = '---------potong disini----------'
        var message = 'Simpan tiket ini baik baik, jangan sampai hilang. Pintu kendaraan harap dikunci. Dilarang meninggalkan karcis dan barang berharga di dalam kendaraan. kerusakan dan kehilangan bukan tanggung jawab manajemen. \nDenda tiket hilang: \nRoda-2: Rp 13.000,- \nRoda-4: Rp 25.000,-';

        function printStruk(kd_trx_parkir, kendaraan, gate, tanggal, jam){
            device.open(function(error){
                printer
                .font('A')
                .align('lt')
                .size(1, 2)
                .text('TIKET MANUAL')
                .text('')
                .text('')
                .font('B')
                .align('ct')
                .size(1, 2)
                .text(location)
                .text('')
                .size(1, 1)
                .text(address)
                .text(liner)
                .align('lt')
                .size(1, 1)
                .text('Tiket : ' + kd_trx_parkir + '     ' + kendaraan)
                .text('Gate  : ' + gate)
                .text('Jam   : ' + tanggal + '/' + jam)
                .text('')
                .align('ct')
                .barcode(kd_trx_parkir, "ITF", 2, 100, "BLW", "A")
                .text(liner)
                .align('lt')
                .text(message)
                .cut()
                .close()
            });
        }

        function printStrukBus(kd_trx_parkir, kendaraan, gate, tanggal, jam){
            device.open(function(error){
                printer
                .font('A')
                .align('lt')
                .size(1, 2)
                .text('TIKET MANUAL')
                .text('')
                .text('')
                .font('B')
                .align('ct')
                .size(1, 2)
                .text(location)
                .text('')
                .size(1, 1)
                .text(address)
                .text(liner)
                .align('lt')
                .size(1, 1)
                .text('Tiket : ' + kd_trx_parkir + '     ' + kendaraan)
                .text('Gate  : ' + gate)
                .text('Jam   : ' + tanggal + '/' + jam)
                .text('')
                .align('ct')
                .barcode(kd_trx_parkir, "ITF", 2, 100, "BLW", "A")
                .text(liner)
                .align('lt')
                .text(message)
                .text(linercut)
                .font('A')
                .align('lt')
                .size(1, 2)
                .text('TIKET MANUAL')
                .text('')
                .font('B')
                .align('lt')
                .size(1, 2)
                .text('MEAL BUS')
                .text('')
                .font('B')
                .align('lt')
                .size(1, 1)
                .text('Tiket : ' + kd_trx_parkir + '     ' + kendaraan)
                .text('Gate  : ' + gate)
                .text('Jam   : ' + tanggal + '/' + jam)
                .text('')
                .align('ct')
                .barcode(kd_trx_parkir, "ITF", 2, 100, "BLW", "A")
                .cut()
                .close()
            });
        }

        function printReport(tanggal, jumlah_motor, pendapatan_motor, jumlah_mobil, pendapatan_mobil, jumlah_elf, pendapatan_elf, jumlah_bus, pendapatan_bus, summary){
            device.open(function(error){
                printer
                .font('A')
                .align('lt')
                .size(1, 2)
                .text('LAPORAN')
                .text('')
                .text('')
                .font('B')
                .align('ct')
                .size(1, 2)
                .text(location)
                .text('')
                .size(1, 1)
                .text(address)
                .text(linerReport)
                .align('lt')
                .size(1, 1)
                .text('Tanggal    : ' + tanggal)
                .text('')
                .text('Motor      : ' + jumlah_motor)
                .text('Pendapatan : ' + pendapatan_motor)
                .text('')
                .text('Mobil      : ' + jumlah_mobil)
                .text('Pendapatan : ' + pendapatan_mobil)
                .text('')
                .text('Elf        : ' + jumlah_elf)
                .text('Pendapatan : ' + pendapatan_elf)
                .text('')
                .text('Bus        : ' + jumlah_bus)
                .text('Pendapatan : ' + pendapatan_bus)
                .text('')
                .text('Total Pendapatan : ' + summary)
                .text(linerReport)
                .text('')
                .text('')
                .text('')
                .text('')
                .cut()
                .close()
            });
        }

        function printLaporanKasir(req){
            var location = req.body.location;
            var address = req.body.address;
            var gate = req.body.gate;
            var tanggal = req.body.tanggal;
            var kasir = req.body.kasir;
            var periode_awal = req.body.periode_awal;
            var periode_akhir = req.body.periode_akhir;
            var tanggal_print = req.body.tanggal_print;
            var total_pendapatan = req.body.total_pendapatan;
            var pendapatan_parkir_mobil = req.body.pendapatan_parkir_mobil;
            var jumlah_parkir_mobil = req.body.jumlah_parkir_mobil;
            var jumlah_stempel_mobil = req.body.jumlah_stempel_mobil;
            var jumlah_free_mobil = req.body.jumlah_free_mobil;
            var pendapatan_parkir_elf = req.body.pendapatan_parkir_elf;
            var jumlah_parkir_elf = req.body.jumlah_parkir_elf;
            var jumlah_stempel_elf = req.body.jumlah_stempel_elf;
            var jumlah_free_elf = req.body.jumlah_free_elf;
            var pendapatan_parkir_bus = req.body.pendapatan_parkir_bus;
            var jumlah_parkir_bus = req.body.jumlah_parkir_bus;
            var jumlah_stempel_bus = req.body.jumlah_stempel_bus;
            var jumlah_free_bus = req.body.jumlah_free_bus;
            var pendapatan_parkir_motor = req.body.pendapatan_parkir_motor;
            var jumlah_parkir_motor = req.body.jumlah_parkir_motor;
            var jumlah_stempel_motor = req.body.jumlah_stempel_motor;
            var jumlah_free_motor = req.body.jumlah_free_motor;
            var pendapatan_parkir = req.body.pendapatan_parkir;
            var jumlah_trx_topup = req.body.jumlah_trx_topup;
            var pendapatan_trx_topup = req.body.pendapatan_trx_topup;
            var jumlah_trx_denda = req.body.jumlah_trx_denda;
            var pendapatan_trx_denda = req.body.pendapatan_trx_denda;
            var last = req.body.last;

            var total_trx_parkir = jumlah_parkir_mobil + jumlah_parkir_elf + jumlah_parkir_bus + jumlah_parkir_motor;
            var total_stempel = jumlah_stempel_mobil + jumlah_stempel_elf + jumlah_stempel_bus + jumlah_stempel_motor;
            var total_free = jumlah_free_mobil + jumlah_free_elf + jumlah_free_bus + jumlah_free_motor;

            device.open(function(error){
                printer
                .font('A')
                .align('ct')
                .size(1, 2)
                .text(location)
                .text(address)
                .text('---------------------------------')
                .font('A')
                .align('lt')
                .size(1, 1)
                .text('STRUK PENDAPATAN')
                .text('GATE         : ' + gate)
                .text('PERIODE AWAL :' + periode_awal)
                .text('PERIODE AKHIR:' + periode_akhir)
                .text('')
                .text('MOBIL')
                .text('Parkir  : ' + jumlah_parkir_mobil + ' Kend ' + formatNumber(pendapatan_parkir_mobil))
                .text('Stempel : ' + jumlah_stempel_mobil + ' Kend')
                .text('Free    : ' + jumlah_free_mobil)
                .text('')
                .text('ELF')
                .text('Parkir  : ' + jumlah_parkir_elf + ' Kend ' + formatNumber(pendapatan_parkir_elf))
                .text('Stempel : ' + jumlah_stempel_elf + ' Kend')
                .text('Free    : ' + jumlah_free_elf)
                .text('')
                .text('BUS')
                .text('Parkir  : ' + jumlah_parkir_bus + ' Kend ' + formatNumber(pendapatan_parkir_bus))
                .text('Stempel : ' + jumlah_stempel_bus + ' Kend')
                .text('Free    : ' + jumlah_free_bus)
                .text('')
                .text('MOTOR')
                .text('Parkir  : ' + jumlah_parkir_motor + ' Kend ' + formatNumber(pendapatan_parkir_motor))
                .text('Stempel : ' + jumlah_stempel_motor + ' Kend')
                .text('Free    : ' + jumlah_free_motor)
                .text('')
                .text('SUBTOTAL')
                .text('Parkir  : ' + total_trx_parkir)
                .text('Tolerir : ' + total_stempel)
                .text('Free    : ' + total_free)
                .text('Pendapatan Parkir : ' + formatNumber(pendapatan_parkir))
                .text('')
                .text('DENDA')
                .text('Jumlah Trx Denda : ' + jumlah_trx_denda)
                .text('Pendapatan Denda : '+ formatNumber(pendapatan_trx_denda))
                .text('')
                .text('TOPUP')
                .text('Jumlah Trx Topup : ' + jumlah_trx_topup)
                .text('Pendapatan Topup : ' + formatNumber(pendapatan_trx_topup))
                .text('')
                .text('TOTAL PENDAPATAN : ' + formatNumber(total_pendapatan))
                .text('TANGGAL PRINT:' + tanggal_print)
                .text('DI PRINT OLEH:' + kasir)
                .text('---------------------------------')
                .text('PENDAPATAN 24 JAM TERAKHIR')
                .text('');

                last.forEach(obj => {
                    printer
                    .text('Periode Awal :' + obj['periode_awal'])
                    .text('Periode Akhir:' + obj['periode_akhir'])
                    .text('kasir        :' + obj['name'])
                    .text('Total Pendapatan: ' + formatNumber(obj['total_pendapatan']))
                    .text('')
                });

                printer
                .text('')
                .text('')
                .text('')
                .text('')
                .text('')
                .cut()
                .close();            
            });            
        }

        function printStrukTopup(req){
            var kd_trx_topup = req.body.kd_trx_topup;
            var nama = req.body.nama;
            var departemen = req.body.departemen;
            var jenis_kendaraan = req.body.jenis_kendaraan;
            var gate = req.body.gate;
            var tanggal_expired = req.body.tanggal_expired;
            var biaya_topup = req.body.biaya_topup;
            var tanggal = req.body.tanggal;
            var jam = req.body.jam;
            var kasir = req.body.kasir;

            device.open(function(error){
                printer
                .font('A')
                .align('ct')
                .size(1, 2)
                .text(location)
                .text(address)
                .text('---------------------------------')
                .align('lt')
                .font('A')
                .size(1, 1)
                .text('ID TRX TOPUP    : ' + kd_trx_topup)
                .text('NAMA            : ' + nama)
                .text('DEPARTEMEN      : ' + departemen)
                .text('JENIS KENDARAAN : ' + jenis_kendaraan)
                .text('GATE            : ' + gate)
                .text('TANGGAL EXPIRED : ' + tanggal_expired)
                .text('BIAYA TOPUP     : ' + biaya_topup)
                .text('TANGGAL         : ' + tanggal)
                .text('JAM             : ' + jam)
                .text('KASIR           : ' + kasir)
                .cut()
                .close();
            });
        }

        function testprint(){
            device.open(function(error){
                printer
                .font('A')
                .align('lt')
                .size(1, 1)
                .text('test escpos')
                .text('test escpos')
                .text('test escpos')
                .text('test escpos')
                .text('test escpos')
                .text('test escpos')
                .cut()
                .close()            
            });
        }

        function formatNumber(num) {
            var currency = 'Rp. ' + num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            return currency;
        }

        module.exports = app;    
    }()
);