import { useState, useEffect } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodProps {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

export function Dashboard() {
  const [foods, setFoods] = useState<FoodProps[]>([]);
  const [editingFood, setEditingFood] = useState<FoodProps>({} as FoodProps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(food: FoodProps) {
    const newFoods = [...foods];

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      newFoods.push(response.data);
      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodProps) {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(food =>
        food.id !== foodUpdated.data.id ? food : foodUpdated.data,
      );

      setFoods(foodsUpdated);

    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(foodId: number) {
    await api.delete(`/foods/${foodId}`);

    const foodsFiltered = foods.filter(food => food.id !== foodId);

    setFoods(foodsFiltered);
  }

  function toggleModal() {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodProps) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={setEditingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};