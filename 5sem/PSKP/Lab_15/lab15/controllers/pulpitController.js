const Pulpit = require('../models/Pulpit');

exports.getAllPulpits = async (req, res) => {
  try {
    const pulpits = await Pulpit.find().sort({ pulpit: 1 });
    
    res.status(200).json({
      success: true,
      count: pulpits.length,
      data: pulpits
    });
  } catch (error) {
    console.error('Ошибка при получении кафедр:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении кафедр'
    });
  }
};

exports.createPulpit = async (req, res) => {
  try {
    const { pulpit, pulpit_name, faculty } = req.body;
    
    if (!pulpit || !pulpit_name || !faculty) {
      return res.status(400).json({
        success: false,
        error: 'Пожалуйста, укажите код кафедры (pulpit), название (pulpit_name) и код факультета (faculty)'
      });
    }
    
    const existingPulpit = await Pulpit.findOne({ pulpit: pulpit.toUpperCase() });
    if (existingPulpit) {
      return res.status(400).json({
        success: false,
        error: `Кафедра с кодом ${pulpit} уже существует`
      });
    }
    
    const newPulpit = new Pulpit({
      pulpit: pulpit.toUpperCase(),
      pulpit_name,
      faculty: faculty.toUpperCase()
    });
    
    const savedPulpit = await newPulpit.save();
    
    res.status(201).json({
      success: true,
      message: 'Кафедра успешно создана',
      data: savedPulpit
    });
    
  } catch (error) {
    console.error('Ошибка при создании кафедры:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании кафедры'
    });
  }
};

exports.updatePulpit = async (req, res) => {
  try {
    const pulpitCode = req.params.id.toUpperCase();
    const updateData = req.body;
    
    if (updateData.pulpit) {
      updateData.pulpit = updateData.pulpit.toUpperCase();
      
      if (updateData.pulpit !== pulpitCode) {
        const existingPulpit = await Pulpit.findOne({ 
          pulpit: updateData.pulpit 
        });
        
        if (existingPulpit) {
          return res.status(400).json({
            success: false,
            error: `Код ${updateData.pulpit} уже используется другой кафедрой`
          });
        }
      }
    }
    
    if (updateData.faculty) {
      updateData.faculty = updateData.faculty.toUpperCase();
    }
    
    const pulpit = await Pulpit.findOneAndUpdate(
      { pulpit: pulpitCode },
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );
    
    if (!pulpit) {
      return res.status(404).json({
        success: false,
        error: `Кафедра с кодом ${pulpitCode} не найден`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Кафедра успешно обновлена',
      data: pulpit
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении кафедры:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении кафедры'
    });
  }
};

exports.deletePulpit = async (req, res) => {
  try {
    const pulpitCode = req.params.id.toUpperCase();
    
    const pulpit = await Pulpit.findOneAndDelete({ 
      pulpit: pulpitCode 
    });
    
    if (!pulpit) {
      return res.status(404).json({
        success: false,
        error: `Кафедра с кодом ${pulpitCode} не найден`
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Кафедра ${pulpitCode} успешно удалена`,
      data: pulpit
    });
    
  } catch (error) {
    console.error('Ошибка при удалении кафедры:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении кафедры'
    });
  }
};