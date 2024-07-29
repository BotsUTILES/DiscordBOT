// ------------------------------------------------DEPENDENCIAS-----------------------------------------------------------------
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Player } = require('discord-player');
const fs = require('fs');

// ------------------------------------------------ARRANQUE-----------------------------------------------------------------
const token = process.env.DISCORD_TOKEN; // Lee la token desde el archivo .env

// Crea una instancia del bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Crear una instancia del reproductor
const player = new Player(client);

// ------------------------------------------------MOMO-----------------------------------------------------------------
// Carpeta donde se encuentran los audios
const audioFolder = "audios";
// Diccionario de palabras clave y rutas
const audioLinks = {
    'fuego': 'fuego.mp3',
    'tento': 'tente.mp3',
    'anashei': 'anashei.mp3',
    'pregunta': 'pregunta.mp3',
    'me llama': 'me llama.mp3',
    'bandera': 'bandera.mp3',
    'pelo': 'pelo.mp3',
    'velorio': 'velorio.mp3',
    'que dicen': 'que dicen.mp3',
    'disciplina': 'disciplina.mp3',
    'perro fiel': 'perro fiel.mp3',
    'tito calderon': 'tito calderon.mp3',
    'ladrillos': 'ladrillos.mp3',
};

// Lista de comandos de audio en formato embed
const audioCommandsEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('COMANDOS DE AUDIOS')
    .setDescription(`
------------------------------
Colocar solo la palabra clave.
------------------------------
Entonces
'fuego' - fuegos artificiales wacho.
'anashei' - anashei a, z , i.
'pregunta' - no sé tu estilo de preguntas.
'me llama' - hit popular del gran momo.
'bandera' - la representas mal, momo.
'pelo' - por su gran corte de pelo.
'velorio' - gratitudes al pelot*do de tu viejo.
'que dicen' - gemido, tengo desconectado los auris.
'disciplina' - audio inspirador.
'perro fiel' - siempre del lado de la fidelidad, como momo.
'tito calderon' - por su icónica referencia.
'ladrillos' - tengo las manos pesadas.
    `);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Comando !momo para mostrar la lista de comandos de audio en formato embed
    if (message.content.toLowerCase() === '!momo') {
        await message.channel.send({ embeds: [audioCommandsEmbed] });
        return;
    }

    // Comando !imagen para enviar una imagen al canal
    if (message.content.toLowerCase() === '!imagen') {
        const imageURL = 'https://yt3.googleusercontent.com/T-kWIkr5qVntiZ4mmwCZcB03bPwdhP02ATksZsCl-oDwrZ_iJQCTvoJTxTs4qablLqHD42BTPvQ=s160-c-k-c0x00ffffff-no-rj'; // Reemplaza con la URL de tu imagen
        await message.channel.send(imageURL);
        return;
    }

    // Revisa si alguna palabra clave está en el mensaje
    for (const keyword in audioLinks) {
        if (message.content.toLowerCase().includes(keyword)) {
            const audioPath = `${audioFolder}/${audioLinks[keyword]}`;

            try {
                // Verifica si el archivo de audio existe
                if (!fs.existsSync(audioPath)) {
                    await message.channel.send(`El archivo ${audioLinks[keyword]} no se encontró.`);
                    return;
                }

                // Conectarse al canal de voz
                const voiceChannel = message.member.voice.channel;
                if (!voiceChannel) {
                    await message.channel.send("Debes estar en un canal de voz para usar este comando.");
                    return;
                }

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });

                const resource = createAudioResource(audioPath);
                const player = createAudioPlayer();

                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                });

                player.on('error', (err) => {
                    message.channel.send(`No se pudo reproducir el archivo MP3: ${err.message}`);
                    connection.destroy();
                });

            } catch (err) {
                await message.channel.send(`No se pudo reproducir el archivo MP3: ${err}`);
            }
            break;
        }
    }
});

// Inicia el bot
client.login(token);
