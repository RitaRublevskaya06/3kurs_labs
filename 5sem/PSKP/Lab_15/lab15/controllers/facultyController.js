const Faculty = require('../models/Faculty');

exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ faculty: 1 });
    
    res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties
    });
  } catch (error) {
    console.error('Ошибка при получении факультетов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении факультетов'
    });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { faculty, faculty_name } = req.body;
    
    if (!faculty || !faculty_name) {
      return res.status(400).json({
        success: false,
        error: 'Пожалуйста, укажите код факультета (faculty) и название (faculty_name)'
      });
    }
    
    const existingFaculty = await Faculty.findOne({ faculty: faculty.toUpperCase() });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        error: `Факультет с кодом ${faculty} уже существует`
      });
    }
    
    const newFaculty = new Faculty({
      faculty: faculty.toUpperCase(),
      faculty_name
    });
    
    const savedFaculty = await newFaculty.save();
    
    res.status(201).json({
      success: true,
      message: 'Факультет успешно создан',
      data: savedFaculty
    });
    
  } catch (error) {
    console.error('Ошибка при создании факультета:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании факультета'
    });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const facultyCode = req.params.id.toUpperCase();
    const updateData = req.body;
    
    if (updateData.faculty) {
      updateData.faculty = updateData.faculty.toUpperCase();
      
      if (updateData.faculty !== facultyCode) {
        const existingFaculty = await Faculty.findOne({ 
          faculty: updateData.faculty 
        });
        
        if (existingFaculty) {
          return res.status(400).json({
            success: false,
            error: `Код ${updateData.faculty} уже используется другим факультетом`
          });
        }
      }
    }
    
    const faculty = await Faculty.findOneAndUpdate(
      { faculty: facultyCode },
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: `Факультет с кодом ${facultyCode} не найден`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Факультет успешно обновлен',
      data: faculty
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении факультета:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении факультета'
    });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const facultyCode = req.params.id.toUpperCase();
    
    const faculty = await Faculty.findOneAndDelete({ 
      faculty: facultyCode 
    });
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: `Факультет с кодом ${facultyCode} не найден`
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Факультет ${facultyCode} успешно удален`,
      data: faculty
    });
    
  } catch (error) {
    console.error('Ошибка при удалении факультета:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении факультета'
    });
  }
};