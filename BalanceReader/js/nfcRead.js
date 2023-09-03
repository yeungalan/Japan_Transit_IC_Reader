import {NFCPortLib, NFCPortError, Configuration, DetectionOption, CommunicationOption, TargetCard} from './NFCPortLib.js';

    let lib = null;
    var detectOption = null;

    export async function initNFC() {
        /* create NFCPortLib object */
        try {
            /* init() */
            lib = new NFCPortLib();

            let config = new Configuration(1000 /* ackTimeout */, 1000 /* receiveTimeout */, true /* autoBaudRate*/, true /* autoDeviceSelect */);
            await lib.init(config);
            console.log('deviceName : ' + lib.deviceName);
            await lib.open();

            /* detectCard(FeliCa Card) */
            detectOption = new DetectionOption(new Uint8Array([0x00, 0x03]), 0, true, false, null);
			//detectOption = new DetectionOption(new Uint8Array([0x80, 0x08]), 0, true, false, null);

            //

            readCard();
			//setInterval(felica_card,500);

        } catch(error) {
			console.log('Error errorType : ' + error.errorType);
			console.log('      message : ' + error.message);

			if (lib != null) {
				//await lib.close();
				//lib = null;
			}
		}

    }
	

	export async function readCard(area) {
		console.log('[Reading a FeliCa Card] Begin');

        
        let finalResult = "";
		//detectTitle.innerText = '';
		//detectMessage.innerText = '';
		//communicateTitle.innerText = '';
		//communicateMessage.innerText = '';

		try {
            //await lib.open();
			let card = await lib.detectCard('iso18092', detectOption)
			.then(ret => {
				//detectTitle.innerText = 'Card is detected';
				if (ret.systemCode == null) {
					console.log('IDm : ' + _array_tohexs(ret.idm) +
								'\nPMm : ' + _array_tohexs(ret.pmm) +
								'\ntargetCardBaudRate : ' + lib.targetCardBaudRate + 'kbps');
				} else {
					console.log('IDm : ' + _array_tohexs(ret.idm) +
								'\nPMm : ' + _array_tohexs(ret.pmm) +
								'\nSystemCode : ' + _array_tohexs(ret.systemCode) +
								'\ntargetCardBaudRate : ' + lib.targetCardBaudRate + 'kbps');
				}
				//detectMessage.innerText = 'IDm : ' + _array_tohexs(ret.idm);
				return ret;
			}, (error) => {
				//detectTitle.innerText = 'Card is not detected';
                alert(error.message);
				throw(error);
			});

			/* communicateThru(Read Block) */
			//let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 1, 0x09,0x10, 1, 0x80,0x01]);
            //let felica_read_without_encryption = new Uint8Array([8, 0xFF, 0xA4, 0x00, 0x01, 0x02, 0x0F, 0x09]);
			//_array_copy(felica_read_without_encryption, 2, card.idm, 0, card.idm.length);

			//let felica_read_without_encryption = new Uint8Array([0x00, 0xA4, 0x04, 0x00, 0x09, 0xA0, 0x00, 0x00, 0x03, 0x08, 0x00, 0x00, 0x10, 0x00]);
			//_array_copy(felica_read_without_encryption, 2, card.idm, 0, card.idm.length);

			//let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 1, 0x09,0x0F, 1, 0x80,0x01]);

			// -1.9
			// ORIG
			// let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 1, 0x09,0x10, 1, 0x80,0x01]);

			//let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 1, 0x0F ,0x09, 1, 0x80,0x00]);
            let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 1, 0x0F ,0x09, 1, 0x80, area]);


			console.log( _array_tohexs(felica_read_without_encryption));
			_array_copy(felica_read_without_encryption, 2, card.idm, 0, card.idm.length);
            //console.log( _array_tohexs(felica_read_without_encryption));

			let response = await lib.communicateThru(felica_read_without_encryption, 100, detectOption)
			.then(ret => {
				//communicateTitle.innerText = 'Reading...';
				//communicateMessage.innerText = 'Send    : ' + _array_tohexs(felica_read_without_encryption) +
				//							   '\nReceive : ' + _array_tohexs(ret);
                finalResult = _array_tohexs(ret);
                console.log(finalResult);
				return ret;
			}, (error) => {
				//communicateTitle.innerText = 'Read error';
                alert(error.message);
				throw(error);
			});

			/* close() */
			//await lib.close();
			//lib = null;


			console.log('Success');


		} catch(error) {
			console.log('Error errorType : ' + error.errorType);
			console.log('      message : ' + error.message);

			if (lib != null) {
				//await lib.close();
				//lib = null;
			}
		}

		console.log('[Reading a FeliCa Card] End');
		return finalResult;
	}


	function _def_val(param, def)
	{
		return (param === undefined) ? def : param;
	}

	function _array_slice(array, offset, length)
	{
		let result;

		length = _def_val(length, array.length - offset);
		result = [];
		_array_copy(result, 0, array, offset, length);
		
		return result;
	}

	function _bytes2hexs(bytes, sep) {
		let str;

		sep = _def_val(sep, ' ');

		return bytes.map(function(byte) {
			str = byte.toString(16);
			return byte < 0x10 ? '0'+str : str;
		}).join(sep).toUpperCase();
	}

	function _array_tohexs(array, offset, length)
	{
		let temp;

		offset = _def_val(offset, 0);
		length = _def_val(length, array.length - offset);

		temp = _array_slice(array, offset, length );
		return _bytes2hexs(temp, '');
	}

	function _array_copy(dest, dest_offset, src, src_offset, length)
	{
		let idx;

		src_offset = _def_val(src_offset, 0);
		length = _def_val(length, src.length);

		for (idx = 0; idx < length; idx++) {
			dest[dest_offset + idx] = src[src_offset + idx];
		}

		return dest;
	}